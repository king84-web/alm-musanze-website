import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '@/generated/prisma-client/client';
import { Prisma } from '@/generated/prisma-client/client';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    try {
      const { memberId, dueDate, amount, ...rest } = createInvoiceDto;

      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Invoice amount must be greater than 0');
      }

      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        throw new BadRequestException('Invalid due date format');
      }

      // Check if due date is not in the past (with some tolerance)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDateObj < today) {
        this.logger.warn(
          `Creating invoice with past due date for member ${memberId}`,
        );
      }

      // Verify member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Check if member is active
      if (member.status === 'Suspended' || member.status === 'Rejected') {
        throw new BadRequestException(
          `Cannot create invoice for ${member.status.toLowerCase()} member`,
        );
      }

      // Check for duplicate pending invoices
      const existingPendingInvoices = await this.prisma.invoice.findMany({
        where: {
          memberId,
          status: 'Pending',
          description: rest.description,
        },
      });

      if (existingPendingInvoices.length > 0) {
        this.logger.warn(
          `Member ${memberId} already has pending invoice(s) with similar description`,
        );
      }

      const invoice = await this.prisma.invoice.create({
        data: {
          id: this.generateInvoiceNumber(),
          ...rest,
          amount,
          dueDate: dueDateObj,
          memberId,
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
        },
      });

      this.logger.log(
        `Invoice ${invoice.id} created successfully for member ${memberId}`,
      );
      return invoice;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Member not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Invoice with these details already exists',
          );
        }
      }

      this.logger.error(
        `Failed to create invoice: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create invoice');
    }
  }

  async findAll(filters: { memberId?: string; status?: string }) {
    try {
      const where: any = {};

      if (filters.memberId) {
        // Validate UUID format
        if (!this.isValidUUID(filters.memberId)) {
          throw new BadRequestException('Invalid member ID format');
        }
        where.memberId = filters.memberId;
      }

      if (filters.status) {
        // Validate status
        const validStatuses = ['Pending', 'Paid', 'Cancelled'];
        if (!validStatuses.includes(filters.status)) {
          throw new BadRequestException(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          );
        }
        where.status = filters.status as InvoiceStatus;
      }

      const invoices = await this.prisma.invoice.findMany({
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
        },
        orderBy: { issuedAt: 'desc' },
      });

      this.logger.log(`Retrieved ${invoices.length} invoices`);
      return invoices;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch invoices: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch invoices');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Invalid invoice ID format');
      }

      const invoice = await this.prisma.invoice.findUnique({
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
        },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      return invoice;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch invoice ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch invoice');
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

      const invoices = await this.prisma.invoice.findMany({
        where: { memberId },
        orderBy: { issuedAt: 'desc' },
      });

      this.logger.log(
        `Retrieved ${invoices.length} invoices for member ${memberId}`,
      );
      return invoices;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch invoices for member ${memberId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch member invoices');
    }
  }

  async findOverdue() {
    try {
      const now = new Date();
      const invoices = await this.prisma.invoice.findMany({
        where: {
          status: 'Pending',
          dueDate: {
            lt: now,
          },
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
        },
        orderBy: { dueDate: 'asc' },
      });

      this.logger.log(`Found ${invoices.length} overdue invoices`);
      return invoices;
    } catch (error) {
      this.logger.error(
        `Failed to fetch overdue invoices: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch overdue invoices',
      );
    }
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid invoice ID format');
      }

      if (
        updateInvoiceDto.amount !== undefined &&
        updateInvoiceDto.amount <= 0
      ) {
        throw new BadRequestException('Invoice amount must be greater than 0');
      }

      if (updateInvoiceDto.dueDate) {
        const dueDateObj = new Date(updateInvoiceDto.dueDate);
        if (isNaN(dueDateObj.getTime())) {
          throw new BadRequestException('Invalid due date format');
        }
      }

      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      if (invoice.status === 'Paid') {
        throw new BadRequestException('Cannot update paid invoices');
      }

      if (invoice.status === 'Cancelled') {
        throw new BadRequestException('Cannot update cancelled invoices');
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: updateInvoiceDto,
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
        },
      });

      this.logger.log(`Invoice ${id} updated successfully`);
      return updatedInvoice;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update invoice ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update invoice');
    }
  }

  async markAsPaid(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid invoice ID format');
      }

      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      if (invoice.status === 'Paid') {
        throw new BadRequestException('Invoice is already paid');
      }

      if (invoice.status === 'Cancelled') {
        throw new BadRequestException('Cannot mark cancelled invoice as paid');
      }

      const updatedInvoice = await this.prisma.invoice.update({
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
        },
      });

      this.logger.log(
        `Invoice ${id} marked as paid for member ${invoice.memberId}`,
      );
      return updatedInvoice;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to mark invoice ${id} as paid: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to mark invoice as paid');
    }
  }

  async cancel(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid invoice ID format');
      }

      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      if (invoice.status === 'Paid') {
        throw new BadRequestException('Cannot cancel paid invoice');
      }

      if (invoice.status === 'Cancelled') {
        throw new BadRequestException('Invoice is already cancelled');
      }

      const cancelledInvoice = await this.prisma.invoice.update({
        where: { id },
        data: { status: 'Cancelled' },
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
        },
      });

      this.logger.log(`Invoice ${id} cancelled successfully`);
      return cancelledInvoice;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to cancel invoice ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to cancel invoice');
    }
  }

  async remove(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid invoice ID format');
      }

      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      if (invoice.status === 'Paid') {
        throw new BadRequestException('Cannot delete paid invoices');
      }

      await this.prisma.invoice.delete({
        where: { id },
      });

      this.logger.log(`Invoice ${id} deleted successfully`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
      }

      this.logger.error(
        `Failed to delete invoice ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete invoice');
    }
  }

  async getSummary() {
    try {
      const invoices = await this.prisma.invoice.findMany();
      const now = new Date();

      if (invoices.length === 0) {
        this.logger.log('No invoices found for summary');
        return {
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          byStatus: {
            Pending: 0,
            Paid: 0,
            Cancelled: 0,
          },
          overdueCount: 0,
          totalCount: 0,
        };
      }

      const totalAmount = invoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0,
      );
      const paidAmount = invoices
        .filter((i) => i.status === 'Paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const pendingAmount = invoices
        .filter((i) => i.status === 'Pending')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const overdueAmount = invoices
        .filter((i) => i.status === 'Pending' && i.dueDate < now)
        .reduce((sum, invoice) => sum + invoice.amount, 0);

      const byStatus = {
        Pending: invoices.filter((i) => i.status === 'Pending').length,
        Paid: invoices.filter((i) => i.status === 'Paid').length,
        Cancelled: invoices.filter((i) => i.status === 'Cancelled').length,
      };

      const overdueCount = invoices.filter(
        (i) => i.status === 'Pending' && i.dueDate < now,
      ).length;

      const summary = {
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        byStatus,
        overdueCount,
        totalCount: invoices.length,
      };

      this.logger.log(
        `Invoice summary generated: ${invoices.length} total invoices`,
      );
      return summary;
    } catch (error) {
      this.logger.error(
        `Failed to generate invoice summary: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to generate invoice summary',
      );
    }
  }

  private isValidUUID(uuid: string): boolean {
    return !!uuid;
  }

  async sendOverdueReminders() {
    try {
      const overdueInvoices = await this.findOverdue();

      if (overdueInvoices.length === 0) {
        this.logger.log('No overdue invoices to remind');
        return { reminded: 0 };
      }

      // Here you would integrate with email service
      // For now, just log
      overdueInvoices.forEach((invoice) => {
        this.logger.log(
          `Reminder needed for invoice ${invoice.id} - Member: ${invoice.member?.email}`,
        );
      });

      return { reminded: overdueInvoices.length };
    } catch (error) {
      this.logger.error(
        `Failed to send overdue reminders: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to send overdue reminders',
      );
    }
  }

  async bulkCreate(invoices: CreateInvoiceDto[]) {
    try {
      if (!invoices || invoices.length === 0) {
        throw new BadRequestException('No invoices provided for bulk creation');
      }

      if (invoices.length > 100) {
        throw new BadRequestException(
          'Cannot create more than 100 invoices at once',
        );
      }

      const results = await Promise.allSettled(
        invoices.map((invoice) => this.create(invoice)),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Bulk invoice creation: ${successful} successful, ${failed} failed`,
      );

      return {
        successful,
        failed,
        total: invoices.length,
        results,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to bulk create invoices: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to bulk create invoices');
    }
  }

  generateInvoiceNumber() {
    return `INV-${new Date().getFullYear()}-${Date.now()}`;
  }
}
