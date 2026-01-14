import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/create-transaction.dto';
import { TransactionType, Prisma } from '@/generated/prisma-client/client';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      const {
        accountId,
        amount,
        type,
        paymentId,
        invoiceId,
        expenseId,
        ...rest
      } = createTransactionDto;

      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException(
          'Transaction amount must be greater than 0',
        );
      }

      // Verify account exists
      const account = await this.prisma.financialAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      // Validate related records if provided
      if (paymentId) {
        const payment = await this.prisma.payment.findUnique({
          where: { id: paymentId },
        });
        if (!payment) {
          throw new NotFoundException(`Payment with ID ${paymentId} not found`);
        }
        // Check if payment already has a transaction
        const existingTx = await this.prisma.transaction.findUnique({
          where: { paymentId },
        });
        if (existingTx) {
          throw new ConflictException(
            'Payment already has a linked transaction',
          );
        }
      }

      if (invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: invoiceId },
        });
        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
      }

      if (expenseId) {
        const expense = await this.prisma.expense.findUnique({
          where: { id: expenseId },
        });
        if (!expense) {
          throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }
        // Check if expense already has a transaction
        const existingTx = await this.prisma.transaction.findUnique({
          where: { expenseId },
        });
        if (existingTx) {
          throw new ConflictException(
            'Expense already has a linked transaction',
          );
        }
      }

      // Calculate new balance
      const newBalance =
        type === 'income' ? account.balance + amount : account.balance - amount;

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient funds in account');
      }

      // Create transaction and update account balance in a transaction
      const transaction = await this.prisma.$transaction(async (prisma) => {
        const tx = await prisma.transaction.create({
          data: {
            ...rest,
            amount,
            type,
            accountId,
            paymentId: paymentId || null,
            invoiceId: invoiceId || null,
            expenseId: expenseId || null,
          },
          include: {
            account: true,
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            approvedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            payment: true,
            invoice: true,
            expense: true,
          },
        });

        await prisma.financialAccount.update({
          where: { id: accountId },
          data: { balance: newBalance },
        });

        return tx;
      });

      this.logger.log(
        `Transaction ${transaction.id} created successfully (${type}: $${amount})`,
      );
      return transaction;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Related record not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Transaction with these details already exists',
          );
        }
      }

      this.logger.error(
        `Failed to create transaction: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  async findAll(filters: {
    type?: string;
    accountId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    memberId?: string;
    paymentId?: string;
    invoiceId?: string;
    expenseId?: string;
  }) {
    try {
      const where: any = {};

      if (filters.type) {
        const validTypes = ['income', 'expense'];
        if (!validTypes.includes(filters.type)) {
          throw new BadRequestException('Invalid transaction type');
        }
        where.type = filters.type as TransactionType;
      }

      if (filters.accountId) {
        if (!this.isValidUUID(filters.accountId)) {
          throw new BadRequestException('Invalid account ID format');
        }
        where.accountId = filters.accountId;
      }

      if (filters.memberId) {
        if (!this.isValidUUID(filters.memberId)) {
          throw new BadRequestException('Invalid member ID format');
        }
        where.memberId = filters.memberId;
      }

      if (filters.category) {
        where.category = { contains: filters.category, mode: 'insensitive' };
      }

      if (filters.paymentId) {
        where.paymentId = filters.paymentId;
      }

      if (filters.invoiceId) {
        where.invoiceId = filters.invoiceId;
      }

      if (filters.expenseId) {
        where.expenseId = filters.expenseId;
      }

      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      const transactions = await this.prisma.transaction.findMany({
        where,
        include: {
          account: true,
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: true,
          invoice: true,
          expense: true,
        },
        orderBy: { date: 'desc' },
      });

      this.logger.log(`Retrieved ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch transactions: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  async findOne(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid transaction ID format');
      }

      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          account: true,
          member: true,
          approvedBy: true,
          payment: true,
          invoice: true,
          expense: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      return transaction;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch transaction ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch transaction');
    }
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid transaction ID format');
      }

      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: { account: true },
      });

      if (!existingTransaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      // Prevent updating transactions linked to payments/invoices/expenses
      if (
        existingTransaction.paymentId ||
        existingTransaction.invoiceId ||
        existingTransaction.expenseId
      ) {
        throw new BadRequestException(
          'Cannot update transactions linked to payments, invoices, or expenses',
        );
      }

      // If amount or type is being changed, recalculate balances
      if (
        updateTransactionDto.amount !== undefined ||
        updateTransactionDto.type !== undefined
      ) {
        const newAmount =
          updateTransactionDto.amount ?? existingTransaction.amount;
        const newType = updateTransactionDto.type ?? existingTransaction.type;

        if (newAmount <= 0) {
          throw new BadRequestException(
            'Transaction amount must be greater than 0',
          );
        }

        // Reverse old transaction effect
        const reversedBalance =
          existingTransaction.type === 'income'
            ? existingTransaction.account.balance - existingTransaction.amount
            : existingTransaction.account.balance + existingTransaction.amount;

        // Apply new transaction effect
        const newBalance =
          newType === 'income'
            ? reversedBalance + newAmount
            : reversedBalance - newAmount;

        if (newBalance < 0) {
          throw new BadRequestException('Insufficient funds in account');
        }

        // Update transaction and account balance
        const updated = await this.prisma.$transaction(async (prisma) => {
          const tx = await prisma.transaction.update({
            where: { id },
            data: updateTransactionDto,
            include: {
              account: true,
              member: true,
              approvedBy: true,
              payment: true,
              invoice: true,
              expense: true,
            },
          });

          await prisma.financialAccount.update({
            where: { id: existingTransaction.accountId },
            data: { balance: newBalance },
          });

          return tx;
        });

        this.logger.log(`Transaction ${id} updated successfully`);
        return updated;
      }

      // Simple update without balance changes
      const updated = await this.prisma.transaction.update({
        where: { id },
        data: updateTransactionDto,
        include: {
          account: true,
          member: true,
          approvedBy: true,
          payment: true,
          invoice: true,
          expense: true,
        },
      });

      this.logger.log(`Transaction ${id} updated successfully`);
      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update transaction ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update transaction');
    }
  }

  async remove(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('Invalid transaction ID format');
      }

      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      // Prevent deletion of transactions linked to payments/invoices/expenses
      if (
        transaction.paymentId ||
        transaction.invoiceId ||
        transaction.expenseId
      ) {
        throw new BadRequestException(
          'Cannot delete transactions linked to payments, invoices, or expenses',
        );
      }

      // Reverse the transaction effect on account balance
      const account = await this.prisma.financialAccount.findUnique({
        where: { id: transaction.accountId },
      });

      if (account) {
        const newBalance =
          transaction.type === 'income'
            ? account.balance - transaction.amount
            : account.balance + transaction.amount;

        await this.prisma.$transaction(async (prisma) => {
          await prisma.transaction.delete({
            where: { id },
          });

          await prisma.financialAccount.update({
            where: { id: transaction.accountId },
            data: { balance: newBalance },
          });
        });
      } else {
        await this.prisma.transaction.delete({
          where: { id },
        });
      }

      this.logger.log(`Transaction ${id} deleted successfully`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
      }

      this.logger.error(
        `Failed to delete transaction ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete transaction');
    }
  }

  async getSummary(startDate?: string, endDate?: string) {
    try {
      const where: any = {};
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      const transactions = await this.prisma.transaction.findMany({ where });

      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const summary = {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionCount: transactions.length,
      };

      this.logger.log('Transaction summary generated');
      return summary;
    } catch (error) {
      this.logger.error(
        `Failed to generate transaction summary: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to generate transaction summary',
      );
    }
  }

  async getByCategory(startDate?: string, endDate?: string) {
    try {
      const where: any = {};
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      const transactions = await this.prisma.transaction.findMany({ where });

      const byCategory = transactions.reduce(
        (acc, transaction) => {
          const category = transaction.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = { income: 0, expense: 0, total: 0 };
          }

          if (transaction.type === 'income') {
            acc[category].income += transaction.amount;
          } else {
            acc[category].expense += transaction.amount;
          }
          acc[category].total = acc[category].income - acc[category].expense;

          return acc;
        },
        {} as Record<
          string,
          { income: number; expense: number; total: number }
        >,
      );

      return byCategory;
    } catch (error) {
      this.logger.error(
        `Failed to get transactions by category: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to get transactions by category',
      );
    }
  }

  // Helper method to validate UUID format
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
