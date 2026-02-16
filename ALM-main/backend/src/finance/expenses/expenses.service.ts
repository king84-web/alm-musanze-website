import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/create-expense.dto';
import { ExpenseStatus, Prisma } from '@/generated/prisma-client/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    try {
      const { requestedBy, amount, ...rest } = createExpenseDto;

      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Expense amount must be greater than 0');
      }

      // Verify requester exists
      const requester = await this.prisma.member.findUnique({
        where: { id: requestedBy },
      });

      if (!requester) {
        throw new NotFoundException(`Member with ID ${requestedBy} not found`);
      }

      const expense = await this.prisma.expense.create({
        data: {
          ...rest,
          amount,
          requestedBy,
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(
        `Expense ${expense.id} created by ${requester.firstName} ${requester.lastName}`,
      );
      return expense;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Requester member not found');
        }
      }

      this.logger.error(
        `Failed to create expense: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create expense');
    }
  }

  async findAll(filters: { status?: string; requestedBy?: string }) {
    try {
      const where: any = {};

      if (filters.status) {
        const validStatuses = [
          'Draft',
          'Submitted',
          'Approved',
          'Rejected',
          'Paid',
        ];
        if (!validStatuses.includes(filters.status)) {
          throw new BadRequestException(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          );
        }
        where.status = filters.status as ExpenseStatus;
      }

      if (filters.requestedBy) {
        if (!this.isValidUUID(filters.requestedBy)) {
          throw new BadRequestException('Invalid requester ID format');
        }
        where.requestedBy = filters.requestedBy;
      }

      const expenses = await this.prisma.expense.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          transaction: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Retrieved ${expenses.length} expenses`);
      return expenses;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch expenses: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch expenses');
    }
  }

  async findOne(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          transaction: {
            include: {
              account: true,
            },
          },
        },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      return expense;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch expense');
    }
  }

  async findPending() {
    try {
      const expenses = await this.prisma.expense.findMany({
        where: {
          OR: [{ status: 'Submitted' }, { status: 'Draft' }],
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Found ${expenses.length} pending expenses`);
      return expenses;
    } catch (error) {
      this.logger.error(
        `Failed to fetch pending expenses: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch pending expenses',
      );
    }
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
        include: { transaction: true },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.status !== 'Draft') {
        throw new BadRequestException('Only draft expenses can be updated');
      }

      if (expense.transaction) {
        throw new BadRequestException(
          'Cannot update expense that has a linked transaction',
        );
      }

      if (
        updateExpenseDto.amount !== undefined &&
        updateExpenseDto.amount <= 0
      ) {
        throw new BadRequestException('Expense amount must be greater than 0');
      }

      const updated = await this.prisma.expense.update({
        where: { id },
        data: updateExpenseDto,
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Expense ${id} updated successfully`);
      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update expense');
    }
  }

  async submit(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.status !== 'Draft') {
        throw new BadRequestException('Only draft expenses can be submitted');
      }

      const submitted = await this.prisma.expense.update({
        where: { id },
        data: { status: 'Submitted' },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Expense ${id} submitted for approval`);
      return submitted;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to submit expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to submit expense');
    }
  }

  async approve(id: string, approvedBy: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      if (!this.isValidUUID(approvedBy)) {
        throw new BadRequestException('Invalid approver ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.status !== 'Submitted') {
        throw new BadRequestException(
          'Only submitted expenses can be approved',
        );
      }

      const approver = await this.prisma.member.findUnique({
        where: { id: approvedBy },
      });

      if (!approver) {
        throw new NotFoundException(`Approver with ID ${approvedBy} not found`);
      }

      if (
        approver.id === expense.requestedBy &&
        (approver.role !== 'ADMIN' || approver.position === 'DEPUTY_TREASURER')
      ) {
        throw new BadRequestException(
          'Cannot approve your own expense request',
        );
      }

      const approved = await this.prisma.expense.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedBy,
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(
        `Expense ${id} approved by ${approver.firstName} ${approver.lastName}`,
      );
      return approved;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to approve expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to approve expense');
    }
  }

  async reject(id: string, rejectedBy: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      if (!this.isValidUUID(rejectedBy)) {
        throw new BadRequestException('Invalid reviewer ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.status !== 'Submitted') {
        throw new BadRequestException(
          'Only submitted expenses can be rejected',
        );
      }

      const reviewer = await this.prisma.member.findUnique({
        where: { id: rejectedBy },
      });

      if (!reviewer) {
        throw new NotFoundException(`Reviewer with ID ${rejectedBy} not found`);
      }

      const rejected = await this.prisma.expense.update({
        where: { id },
        data: {
          status: 'Rejected',
          approvedBy: rejectedBy,
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Expense ${id} rejected`);
      return rejected;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to reject expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to reject expense');
    }
  }

  async markAsPaid(id: string, accountId: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      if (!this.isValidUUID(accountId)) {
        throw new BadRequestException('Invalid account ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
        include: { transaction: true },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.status !== 'Approved') {
        throw new BadRequestException(
          'Only approved expenses can be marked as paid',
        );
      }

      if (expense.transaction) {
        throw new BadRequestException(
          'Expense already has a linked transaction',
        );
      }

      // Verify account exists
      const account = await this.prisma.financialAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      // Check if account has sufficient balance
      if (account.balance < expense.amount) {
        throw new BadRequestException(
          `Insufficient funds in account. Available: RWF ${account.balance}, Required: RWF${expense.amount}`,
        );
      }

      // Mark as paid and create transaction in one atomic operation
      const result = await this.prisma.$transaction(async (prisma) => {
        const paidExpense = await prisma.expense.update({
          where: { id },
          data: {
            status: 'Paid',
            paidAt: new Date(),
          },
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        // Create expense transaction
        await prisma.transaction.create({
          data: {
            description: `Expense payment: ${expense.title}`,
            amount: expense.amount,
            type: 'expense',
            category: 'Expense',
            paymentMethod: 'BankTransfer',
            accountId,
            memberId: expense.requestedBy,
            expenseId: expense.id,
          },
        });

        // Update account balance
        await prisma.financialAccount.update({
          where: { id: accountId },
          data: { balance: { decrement: expense.amount } },
        });

        return paidExpense;
      });

      this.logger.log(
        `Expense ${id} marked as paid with transaction created in account ${accountId}`,
      );
      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to mark expense ${id} as paid: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to mark expense as paid');
    }
  }

  async remove(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid expense ID format');
      }

      const expense = await this.prisma.expense.findUnique({
        where: { id },
        include: { transaction: true },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.status === 'Paid') {
        throw new BadRequestException('Cannot delete paid expenses');
      }

      if (expense.transaction) {
        throw new BadRequestException(
          'Cannot delete expense with linked transaction',
        );
      }

      await this.prisma.expense.delete({
        where: { id },
      });

      this.logger.log(`Expense ${id} deleted successfully`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Expense with ID ${id} not found`);
        }
      }

      this.logger.error(
        `Failed to delete expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete expense');
    }
  }

  async getSummary() {
    try {
      const expenses = await this.prisma.expense.findMany();

      if (expenses.length === 0) {
        return {
          totalAmount: 0,
          approvedAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          byStatus: {
            Draft: 0,
            Submitted: 0,
            Approved: 0,
            Rejected: 0,
            Paid: 0,
          },
          totalCount: 0,
        };
      }

      const totalAmount = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const approvedAmount = expenses
        .filter((e) => e.status === 'Approved' || e.status === 'Paid')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const paidAmount = expenses
        .filter((e) => e.status === 'Paid')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const pendingAmount = expenses
        .filter((e) => e.status === 'Submitted')
        .reduce((sum, expense) => sum + expense.amount, 0);

      const byStatus = {
        Draft: expenses.filter((e) => e.status === 'Draft').length,
        Submitted: expenses.filter((e) => e.status === 'Submitted').length,
        Approved: expenses.filter((e) => e.status === 'Approved').length,
        Rejected: expenses.filter((e) => e.status === 'Rejected').length,
        Paid: expenses.filter((e) => e.status === 'Paid').length,
      };

      this.logger.log(
        `Expense summary generated: ${expenses.length} total expenses`,
      );
      return {
        totalAmount,
        approvedAmount,
        paidAmount,
        pendingAmount,
        byStatus,
        totalCount: expenses.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate expense summary: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to generate expense summary',
      );
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
