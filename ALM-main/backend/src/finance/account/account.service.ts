import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { AccountType } from '@/generated/prisma-client/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    return this.prisma.financialAccount.create({
      data: createAccountDto,
    });
  }

  async findAll(type?: string) {
    const where = type ? { type: type as AccountType } : {};
    return this.prisma.financialAccount.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.financialAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    try {
      return await this.prisma.financialAccount.update({
        where: { id },
        data: updateAccountDto,
      });
    } catch (error) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.financialAccount.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }

  async getBalance(id: string) {
    const account = await this.prisma.financialAccount.findUnique({
      where: { id },
      select: { id: true, name: true, balance: true, type: true },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async getSummary() {
    const accounts = await this.prisma.financialAccount.findMany();

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountsByType = accounts.reduce(
      (acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + account.balance;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalBalance,
      accountsByType,
      accountCount: accounts.length,
    };
  }
}
