import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { ExpensesController } from './expenses/expenses.controller';
import { ExpensesService } from './expenses/expenses.service';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { AccountsController } from './account/account.controller';
import { AccountsService } from './account/account.service';
import { ExportController } from './export/export.controller';
import { ExportService } from './export/export.service';

@Module({
  controllers: [
    AccountsController,
    TransactionsController,
    PaymentsController,
    ExpensesController,
    InvoicesController,
    ExportController,
  ],
  providers: [
    PrismaService,
    AccountsService,
    TransactionsService,
    PaymentsService,
    ExpensesService,
    InvoicesService,
    PrismaService,
    ExportService,
  ],
  exports: [
    AccountsService,
    TransactionsService,
    PaymentsService,
    ExpensesService,
    InvoicesService,
    ExportService,
  ],
})
export class FinanceModule {}
