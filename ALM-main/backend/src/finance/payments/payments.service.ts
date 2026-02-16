import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, Prisma } from '@/generated/prisma-client/client';
import { PAYMENT_PURPOSE_OPTIONS } from '@/@types';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, createdBy: string) {
    try {
      const {
        memberId,
        amount,
        invoiceId,
        payerType,
        payerEmail,
        payerName,
        payerPhone,
        ...rest
      } = createPaymentDto;

      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      // Verify member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member && memberId && payerType === 'MEMBER') {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      if (invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { payments: true },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }

        if (invoice.memberId !== memberId) {
          throw new BadRequestException(
            'Invoice does not belong to this member',
          );
        }

        if (invoice.status === 'Cancelled') {
          throw new BadRequestException(
            'Cannot make payment for cancelled invoice',
          );
        }

        if (invoice.status === 'Paid') {
          throw new BadRequestException('Invoice is already fully paid');
        }

        const totalPaid = invoice.payments.reduce(
          (sum, p) => sum + p.amount,
          0,
        );
        const remainingAmount = invoice.amount - totalPaid;

        if (amount > remainingAmount) {
          throw new BadRequestException(
            `Payment amount ($${amount}) exceeds remaining invoice amount ($${remainingAmount})`,
          );
        }
      }

      if (payerType !== 'MEMBER' && memberId === '') {
        await this.prisma.$transaction(async (prisma) => {
          const payment = await prisma.payment.create({
            data: {
              ...rest,
              payerType,
              amount,
              createdBy,
              payer: {
                create: {
                  type: payerType,
                  name: payerName,
                  email: payerEmail,
                  phone: payerPhone,
                },
              },
            },
            include: {
              payer: true,
            },
          });
          this.logger.log(
            `Payment ${payment.id} created for non-member payer - Amount: ${amount}`,
          );
          return payment;
        });
      } else {
        const payment = await this.prisma.payment.create({
          data: {
            ...rest,
            payerType,
            amount,
            memberId,
            invoiceId: invoiceId || null,
            createdBy,
          },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                membershipId: true,
              },
            },
            invoice: true,
          },
        });

        this.logger.log(
          `Payment ${payment.id} created for member ${memberId} - Amount: $${amount}`,
        );
        return payment;
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Member or Invoice not found');
        }
      }

      this.logger.error(
        `Failed to create payment: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create payment');
    }
  }

  async findAll(filters: {
    memberId?: string;
    status?: string;
    purpose?: string;
    invoiceId?: string;
  }) {
    try {
      const where: any = {};

      if (filters.memberId) {
        if (!this.isValidUUID(filters.memberId)) {
          throw new BadRequestException('Invalid member ID format');
        }
        where.memberId = filters.memberId;
      }

      if (filters.status) {
        const validStatuses = ['Paid', 'Unpaid', 'Partial'];
        if (!validStatuses.includes(filters.status)) {
          throw new BadRequestException(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          );
        }
        where.status = filters.status as PaymentStatus;
      }

      if (filters.purpose) {
        where.purpose = { contains: filters.purpose, mode: 'insensitive' };
      }

      if (filters.invoiceId) {
        where.invoiceId = filters.invoiceId;
      }

      const payments = await this.prisma.payment.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              membershipId: true,
            },
          },
          payer: true,
          invoice: true,
          transaction: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      console.log( payments );

      this.logger.log(`Retrieved ${payments.length} payments`);
      return payments;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch payments: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch payments');
    }
  }

  async findOne(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid payment ID format');
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              membershipId: true,
            },
          },
          invoice: true,
          transaction: true,
        },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      return payment;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch payment ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch payment');
    }
  }

  async findByMember(memberId: string) {
    try {
      if (!this.isValidUUID(memberId)) {
        throw new BadRequestException('Invalid member ID format');
      }

      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      const payments = await this.prisma.payment.findMany({
        where: { memberId },
        include: { invoice: true, transaction: true },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(
        `Retrieved ${payments.length} payments for member ${memberId}`,
      );
      return payments;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch payments for member ${memberId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch member payments');
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid payment ID format');
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: { transaction: true },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      // Prevent updating if payment has a linked transaction
      if (payment.transaction) {
        throw new BadRequestException(
          'Cannot update payment that has a linked transaction',
        );
      }

      if (
        updatePaymentDto.amount !== undefined &&
        updatePaymentDto.amount <= 0
      ) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      const updated = await this.prisma.payment.update({
        where: { id },
        data: updatePaymentDto,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              membershipId: true,
            },
          },
          invoice: true,
          transaction: true,
        },
      });

      this.logger.log(`Payment ${id} updated successfully`);
      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update payment ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update payment');
    }
  }

  async markAsPaid(
    id: string,
    createTransaction: boolean = true,
    accountId?: string,
  ) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid payment ID format');
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: { invoice: true, member: true },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      if (payment.status === 'Paid') {
        throw new BadRequestException('Payment is already marked as paid');
      }

      if (createTransaction && !accountId) {
        throw new BadRequestException(
          'Account is required to create transaction',
        );
      }

      if (createTransaction && accountId) {
        if (!this.isValidUUID(accountId)) {
          throw new BadRequestException('Invalid account ID format');
        }

        const account = await this.prisma.financialAccount.findUnique({
          where: { id: accountId },
        });

        if (!account) {
          throw new NotFoundException(`Account with ID ${accountId} not found`);
        }

        // Create payment update and transaction in a single transaction
        const result = await this.prisma.$transaction(async (prisma) => {
          const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
              status: 'Paid',
              paidAt: new Date(),
            },
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  membershipId: true,
                },
              },
              invoice: true,
            },
          });
          const description = payment.description
            ? payment.description
            : `Payment received: ${PAYMENT_PURPOSE_OPTIONS.find((p) => p.value === payment.purpose || p.value === 'OTHER')?.label}`;
          // Create transaction for this payment
          await prisma.transaction.create({
            data: {
              description,
              amount: payment.amount,
              type: 'income',
              category: 'Payment',
              paymentMethod: payment.method,
              accountId,
              memberId: payment.memberId,
              paymentId: payment.id,
            },
          });

          // Update account balance
          await prisma.financialAccount.update({
            where: { id: accountId },
            data: { balance: { increment: payment.amount } },
          });

          // If linked to invoice, update invoice status if fully paid
          if (payment.invoiceId) {
            const invoice = await prisma.invoice.findUnique({
              where: { id: payment.invoiceId },
              include: { payments: true },
            });

            if (invoice) {
              const totalPaid =
                invoice.payments
                  .filter((p) => p.status === 'Paid')
                  .reduce((sum, p) => sum + p.amount, 0) + payment.amount;

              if (totalPaid >= invoice.amount) {
                await prisma.invoice.update({
                  where: { id: invoice.id },
                  data: { status: 'Paid', paidAt: new Date() },
                });
              }
            }
          }

          return updatedPayment;
        });

        this.logger.log(
          `Payment ${id} marked as paid with transaction created in account ${accountId}`,
        );
        return result;
      }

      const updated = await this.prisma.payment.update({
        where: { id },
        data: {
          status: 'Paid',
          paidAt: new Date(),
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              membershipId: true,
            },
          },
          invoice: true,
        },
      });

      this.logger.log(`Payment ${id} marked as paid`);
      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to mark payment ${id} as paid: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to mark payment as paid');
    }
  }

  async remove(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid payment ID format');
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: { transaction: true },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      // Prevent deletion if payment has a linked transaction
      if (payment.transaction) {
        throw new BadRequestException(
          'Cannot delete payment that has a linked transaction. Delete the transaction first.',
        );
      }

      await this.prisma.payment.delete({
        where: { id },
      });

      this.logger.log(`Payment ${id} deleted successfully`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Payment with ID ${id} not found`);
        }
      }

      this.logger.error(
        `Failed to delete payment ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete payment');
    }
  }

  async getSummary() {
    try {
      const payments = await this.prisma.payment.findMany();

      if (payments.length === 0) {
        return {
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          partialAmount: 0,
          byStatus: { Paid: 0, Unpaid: 0, Partial: 0 },
          totalCount: 0,
        };
      }

      const totalAmount = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const paidAmount = payments
        .filter((p) => p.status === 'Paid')
        .reduce((sum, payment) => sum + payment.amount, 0);
      const unpaidAmount = payments
        .filter((p) => p.status === 'Unpaid')
        .reduce((sum, payment) => sum + payment.amount, 0);
      const partialAmount = payments
        .filter((p) => p.status === 'Partial')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const byStatus = {
        Paid: payments.filter((p) => p.status === 'Paid').length,
        Unpaid: payments.filter((p) => p.status === 'Unpaid').length,
        Partial: payments.filter((p) => p.status === 'Partial').length,
      };

      this.logger.log(
        `Payment summary generated: ${payments.length} total payments`,
      );
      return {
        totalAmount,
        paidAmount,
        unpaidAmount,
        partialAmount,
        byStatus,
        totalCount: payments.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate payment summary: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to generate payment summary',
      );
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
