// import {
//   Injectable,
//   Logger,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { PrismaService } from '@/prisma/prisma.service';
// import PDFDocument from 'pdfkit';
// import * as ExcelJS from 'exceljs';
// import { Response } from 'express';
// import fs from 'fs';
// import path from 'path';

// @Injectable()
// export class ExportService {
//   private readonly logger = new Logger(ExportService.name);

//   constructor(private prisma: PrismaService) {}

//   private fontsLoaded = false;
//   private dmSansRegular: Buffer | null = null;
//   private dmSansBold: Buffer | null = null;
//   private dmSansMedium: Buffer | null = null;
//   private async loadFonts(): Promise<void> {
//     try {
//       // You need to download DM Sans font files and place them in your project
//       // Or load from Google Fonts CDN
//       const fontPath = path.join(process.cwd(), 'assets', 'static');

//       this.dmSansRegular = fs.readFileSync(
//         path.join(fontPath, 'DMSans-Regular.ttf'),
//       );
//       this.dmSansBold = fs.readFileSync(path.join(fontPath, 'DMSans-Bold.ttf'));
//       this.dmSansMedium = fs.readFileSync(
//         path.join(fontPath, 'DMSans-Medium.ttf'),
//       );

//       this.fontsLoaded = true;
//       this.logger.log('DM Sans fonts loaded successfully');
//     } catch (error) {
//       this.logger.warn('Could not load DM Sans fonts, using default fonts');
//     }
//   }

//   /**
//    * Export transactions to PDF
//    */
//   async exportTransactionsToPDF(filters: any, res: Response): Promise<void> {
//     try {
//       const transactions = await this.prisma.transaction.findMany({
//         where: this.buildTransactionFilters(filters),
//         include: {
//           account: true,
//           member: true,
//         },
//         orderBy: { date: 'desc' },
//       });

//       const doc = new PDFDocument({ margin: 50 });
//       this.loadFonts();
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader(
//         'Content-Disposition',
//         `attachment; filename=transactions-${Date.now()}.pdf`,
//       );
//       if (this.fontsLoaded) {
//         doc.registerFont('DMSans-Regular', this.dmSansRegular!);
//         doc.registerFont('DMSans-Bold', this.dmSansBold!);
//         doc.registerFont('DMSans-Medium', this.dmSansMedium!);
//       }
//       doc.pipe(res);

//       // Header

//       doc.fontSize(20).text('Transaction Report', { align: 'center' });
//       doc.moveDown();
//       doc
//         .fontSize(10)
//         .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
//       doc.moveDown(2);

//       // Summary
//       const totalIncome = transactions
//         .filter((t) => t.type === 'income')
//         .reduce((sum, t) => sum + t.amount, 0);
//       const totalExpense = transactions
//         .filter((t) => t.type === 'expense')
//         .reduce((sum, t) => sum + t.amount, 0);

//       doc.fontSize(12).text('Summary', { underline: true });
//       doc.fontSize(10);
//       doc.text(`Total Income: $${totalIncome.toFixed(2)}`);
//       doc.text(`Total Expense: $${totalExpense.toFixed(2)}`);
//       doc.text(`Net Balance: $${(totalIncome - totalExpense).toFixed(2)}`);
//       doc.text(`Total Transactions: ${transactions.length}`);
//       doc.moveDown(2);

//       // Transactions Table
//       doc.fontSize(12).text('Transactions', { underline: true });
//       doc.moveDown();

//       transactions.forEach((transaction, index) => {
//         if (index > 0 && index % 20 === 0) {
//           doc.addPage();
//         }

//         doc.fontSize(9);
//         doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`);
//         doc.text(`Description: ${transaction.description}`);
//         doc.text(`Type: ${transaction.type.toUpperCase()}`);
//         doc.text(`Amount: $${transaction.amount.toFixed(2)}`);
//         doc.text(`Category: ${transaction.category}`);
//         doc.text(`Account: ${transaction.account.name}`);
//         doc.moveDown(0.5);
//         doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
//         doc.moveDown(0.5);
//       });

//       doc.end();
//       this.logger.log('PDF export completed successfully');
//     } catch (error) {
//       this.logger.error(`Failed to export PDF: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Failed to export PDF');
//     }
//   }

//   /**
//    * Export transactions to Excel
//    */
//   async exportTransactionsToExcel(filters: any, res: Response): Promise<void> {
//     try {
//       const transactions = await this.prisma.transaction.findMany({
//         where: this.buildTransactionFilters(filters),
//         include: {
//           account: true,
//           member: true,
//         },
//         orderBy: { date: 'desc' },
//       });

//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet('Transactions');

//       // Define columns
//       worksheet.columns = [
//         { header: 'Date', key: 'date', width: 15 },
//         { header: 'Description', key: 'description', width: 30 },
//         { header: 'Type', key: 'type', width: 10 },
//         { header: 'Category', key: 'category', width: 15 },
//         { header: 'Amount', key: 'amount', width: 15 },
//         { header: 'Payment Method', key: 'paymentMethod', width: 15 },
//         { header: 'Account', key: 'account', width: 20 },
//         { header: 'Member', key: 'member', width: 20 },
//         { header: 'Reference', key: 'reference', width: 20 },
//       ];

//       // Style header
//       worksheet.getRow(1).font = { bold: true };
//       worksheet.getRow(1).fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FF4472C4' },
//       };
//       worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

//       // Add data
//       transactions.forEach((transaction) => {
//         worksheet.addRow({
//           date: new Date(transaction.date).toLocaleDateString(),
//           description: transaction.description,
//           type: transaction.type.toUpperCase(),
//           category: transaction.category,
//           amount: transaction.amount,
//           paymentMethod: transaction.paymentMethod,
//           account: transaction.account.name,
//           member: transaction.member
//             ? `${transaction.member.firstName} ${transaction.member.lastName}`
//             : 'N/A',
//           reference: transaction.reference || 'N/A',
//         });
//       });

//       // Add summary
//       worksheet.addRow([]);
//       worksheet.addRow(['Summary']);
//       const totalIncome = transactions
//         .filter((t) => t.type === 'income')
//         .reduce((sum, t) => sum + t.amount, 0);
//       const totalExpense = transactions
//         .filter((t) => t.type === 'expense')
//         .reduce((sum, t) => sum + t.amount, 0);
//       worksheet.addRow(['Total Income', '', '', '', totalIncome]);
//       worksheet.addRow(['Total Expense', '', '', '', totalExpense]);
//       worksheet.addRow(['Net Balance', '', '', '', totalIncome - totalExpense]);

//       // Format currency
//       worksheet.getColumn('amount').numFmt = '$#,##0.00';

//       res.setHeader(
//         'Content-Type',
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       );
//       res.setHeader(
//         'Content-Disposition',
//         `attachment; filename=transactions-${Date.now()}.xlsx`,
//       );

//       await workbook.xlsx.write(res);
//       res.end();

//       this.logger.log('Excel export completed successfully');
//     } catch (error) {
//       this.logger.error(
//         `Failed to export Excel: ${error.message}`,
//         error.stack,
//       );
//       throw new InternalServerErrorException('Failed to export Excel');
//     }
//   }

//   /**
//    * Export financial report
//    */
//   async exportFinancialReport(
//     startDate: string,
//     endDate: string,
//     res: Response,
//     format: 'pdf' | 'excel',
//   ): Promise<void> {
//     try {
//       const [transactions, accounts, payments, expenses, invoices] =
//         await Promise.all([
//           this.prisma.transaction.findMany({
//             where: {
//               date: {
//                 gte: new Date(startDate),
//                 lte: new Date(endDate),
//               },
//             },
//           }),
//           this.prisma.financialAccount.findMany(),
//           this.prisma.payment.findMany({
//             where: {
//               createdAt: {
//                 gte: new Date(startDate),
//                 lte: new Date(endDate),
//               },
//             },
//           }),
//           this.prisma.expense.findMany({
//             where: {
//               createdAt: {
//                 gte: new Date(startDate),
//                 lte: new Date(endDate),
//               },
//             },
//           }),
//           this.prisma.invoice.findMany({
//             where: {
//               issuedAt: {
//                 gte: new Date(startDate),
//                 lte: new Date(endDate),
//               },
//             },
//           }),
//         ]);

//       if (format === 'pdf') {
//         await this.generateFinancialReportPDF(
//           { transactions, accounts, payments, expenses, invoices },
//           startDate,
//           endDate,
//           res,
//         );
//       } else {
//         await this.generateFinancialReportExcel(
//           { transactions, accounts, payments, expenses, invoices },
//           startDate,
//           endDate,
//           res,
//         );
//       }
//     } catch (error) {
//       this.logger.error(
//         `Failed to export financial report: ${error.message}`,
//         error.stack,
//       );
//       throw new InternalServerErrorException(
//         'Failed to export financial report',
//       );
//     }
//   }

//   private async generateFinancialReportPDF(
//     data: any,
//     startDate: string,
//     endDate: string,
//     res: Response,
//   ): Promise<void> {
//     const doc = new PDFDocument({ margin: 50 });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=financial-report-${Date.now()}.pdf`,
//     );

//     doc.pipe(res);

//     // Title
//     doc.fontSize(24).text('Financial Report', { align: 'center' });
//     doc
//       .fontSize(12)
//       .text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
//     doc.moveDown(2);

//     // Calculate metrics
//     const totalIncome = data.transactions
//       .filter((t: any) => t.type === 'income')
//       .reduce((sum: number, t: any) => sum + t.amount, 0);
//     const totalExpense = data.transactions
//       .filter((t: any) => t.type === 'expense')
//       .reduce((sum: number, t: any) => sum + t.amount, 0);
//     const totalBalance = data.accounts.reduce(
//       (sum: number, acc: any) => sum + acc.balance,
//       0,
//     );
//     const paidPayments = data.payments.filter(
//       (p: any) => p.status === 'Paid',
//     ).length;
//     const paidInvoices = data.invoices.filter(
//       (i: any) => i.status === 'Paid',
//     ).length;
//     const paidExpenses = data.expenses.filter(
//       (e: any) => e.status === 'Paid',
//     ).length;

//     // Summary Section
//     doc.fontSize(16).text('Executive Summary', { underline: true });
//     doc.moveDown();
//     doc.fontSize(12);
//     doc.text(`Total Assets: $${totalBalance.toFixed(2)}`);
//     doc.text(`Total Income: $${totalIncome.toFixed(2)}`);
//     doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`);
//     doc.text(`Net Income: $${(totalIncome - totalExpense).toFixed(2)}`);
//     doc.moveDown(2);

//     // Accounts Section
//     doc.fontSize(16).text('Account Balances', { underline: true });
//     doc.moveDown();
//     doc.fontSize(11);
//     data.accounts.forEach((account: any) => {
//       doc.text(
//         `${account.name} (${account.type}): $${account.balance.toFixed(2)}`,
//       );
//     });
//     doc.moveDown(2);

//     // Activity Section
//     doc.fontSize(16).text('Activity Summary', { underline: true });
//     doc.moveDown();
//     doc.fontSize(11);
//     doc.text(`Total Transactions: ${data.transactions.length}`);
//     doc.text(`Payments Received: ${paidPayments}/${data.payments.length}`);
//     doc.text(`Invoices Paid: ${paidInvoices}/${data.invoices.length}`);
//     doc.text(`Expenses Paid: ${paidExpenses}/${data.expenses.length}`);

//     doc.end();
//   }

//   private async generateFinancialReportExcel(
//     data: any,
//     startDate: string,
//     endDate: string,
//     res: Response,
//   ): Promise<void> {
//     const workbook = new ExcelJS.Workbook();

//     // Summary Sheet
//     const summarySheet = workbook.addWorksheet('Summary');
//     summarySheet.columns = [
//       { header: 'Metric', key: 'metric', width: 30 },
//       { header: 'Value', key: 'value', width: 20 },
//     ];

//     const totalIncome = data.transactions
//       .filter((t: any) => t.type === 'income')
//       .reduce((sum: number, t: any) => sum + t.amount, 0);
//     const totalExpense = data.transactions
//       .filter((t: any) => t.type === 'expense')
//       .reduce((sum: number, t: any) => sum + t.amount, 0);
//     const totalBalance = data.accounts.reduce(
//       (sum: number, acc: any) => sum + acc.balance,
//       0,
//     );

//     summarySheet.addRow({
//       metric: 'Period',
//       value: `${startDate} to ${endDate}`,
//     });
//     summarySheet.addRow({ metric: 'Total Assets', value: totalBalance });
//     summarySheet.addRow({ metric: 'Total Income', value: totalIncome });
//     summarySheet.addRow({ metric: 'Total Expenses', value: totalExpense });
//     summarySheet.addRow({
//       metric: 'Net Income',
//       value: totalIncome - totalExpense,
//     });

//     // Transactions Sheet
//     const txSheet = workbook.addWorksheet('Transactions');
//     txSheet.columns = [
//       { header: 'Date', key: 'date', width: 15 },
//       { header: 'Description', key: 'description', width: 30 },
//       { header: 'Type', key: 'type', width: 10 },
//       { header: 'Amount', key: 'amount', width: 15 },
//       { header: 'Category', key: 'category', width: 15 },
//     ];
//     data.transactions.forEach((tx: any) => {
//       txSheet.addRow({
//         date: new Date(tx.date).toLocaleDateString(),
//         description: tx.description,
//         type: tx.type,
//         amount: tx.amount,
//         category: tx.category,
//       });
//     });

//     // Accounts Sheet
//     const accountsSheet = workbook.addWorksheet('Accounts');
//     accountsSheet.columns = [
//       { header: 'Name', key: 'name', width: 20 },
//       { header: 'Type', key: 'type', width: 15 },
//       { header: 'Balance', key: 'balance', width: 15 },
//     ];
//     data.accounts.forEach((acc: any) => {
//       accountsSheet.addRow({
//         name: acc.name,
//         type: acc.type,
//         balance: acc.balance,
//       });
//     });

//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     );
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=financial-report-${Date.now()}.xlsx`,
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   }

//   private buildTransactionFilters(filters: any): any {
//     const where: any = {};

//     if (filters.type) where.type = filters.type;
//     if (filters.accountId) where.accountId = filters.accountId;
//     if (filters.category) where.category = { contains: filters.category };
//     if (filters.startDate || filters.endDate) {
//       where.date = {};
//       if (filters.startDate) where.date.gte = new Date(filters.startDate);
//       if (filters.endDate) where.date.lte = new Date(filters.endDate);
//     }

//     return where;
//   }
// }

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private fontsLoaded = false;
  private dmSansRegular: Buffer | null = null;
  private dmSansBold: Buffer | null = null;
  private dmSansMedium: Buffer | null = null;

  constructor(private prisma: PrismaService) {
    this.loadFonts();
  }

  /**
   * Load DM Sans fonts from assets folder
   */
  private async loadFonts(): Promise<void> {
    try {
      const fontPath = path.join(process.cwd(), 'assets', 'static');

      if (fs.existsSync(path.join(fontPath, 'DMSans-Regular.ttf'))) {
        this.dmSansRegular = fs.readFileSync(
          path.join(fontPath, 'DMSans-Regular.ttf'),
        );
        this.dmSansBold = fs.readFileSync(
          path.join(fontPath, 'DMSans-Bold.ttf'),
        );
        this.dmSansMedium = fs.readFileSync(
          path.join(fontPath, 'DMSans-Medium.ttf'),
        );
        this.fontsLoaded = true;
        this.logger.log('✓ DM Sans fonts loaded successfully');
      } else {
        this.logger.warn(
          '⚠ DM Sans fonts not found in assets/fonts folder. Using system fonts.',
        );
        this.logger.warn(
          '  Download from: https://fonts.google.com/specimen/DM+Sans',
        );
      }
    } catch (error) {
      this.logger.warn(
        `⚠ Could not load DM Sans fonts: ${error.message}. Using system fonts.`,
      );
    }
  }

  /**
   * Register fonts with PDFKit document
   */
  private registerFonts(doc: any): void {
    if (
      this.fontsLoaded &&
      this.dmSansRegular &&
      this.dmSansBold &&
      this.dmSansMedium
    ) {
      try {
        doc.registerFont('DMSans', this.dmSansRegular);
        doc.registerFont('DMSans-Bold', this.dmSansBold);
        doc.registerFont('DMSans-Medium', this.dmSansMedium);
      } catch (error) {
        this.logger.warn('Failed to register fonts, using fallback');
        this.fontsLoaded = false;
      }
    }
  }

  /**
   * Get font name (returns DM Sans if loaded, otherwise Helvetica)
   */
  private getFont(weight: 'regular' | 'medium' | 'bold' = 'regular'): string {
    if (!this.fontsLoaded) {
      return weight === 'bold' ? 'Helvetica-Bold' : 'Helvetica';
    }
    switch (weight) {
      case 'bold':
        return 'DMSans-Bold';
      case 'medium':
        return 'DMSans-Medium';
      default:
        return 'DMSans';
    }
  }

  /**
   * Export transactions to PDF with professional design
   */
  async exportTransactionsToPDF(filters: any, res: Response): Promise<void> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: this.buildTransactionFilters(filters),
        include: {
          account: true,
          member: true,
        },
        orderBy: { date: 'desc' },
      });

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true,
        autoFirstPage: false,
      });

      this.registerFonts(doc);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="transactions-${Date.now()}.pdf"`,
      );

      res.set({
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      });

      doc.pipe(res);

      // Add first page
      doc.addPage();

      // ========================================
      // HEADER SECTION WITH LOGO AREA
      // ========================================

      const logoPath = path.join(process.cwd(), 'assets', 'logo');
      const logoExists = path.join(logoPath, 'alm-logo.jpeg');
      this.drawHeader(doc, 'Financial Report', logoExists, '#2C3E50');


      doc.moveDown(2);

      // ========================================
      // SUMMARY CARD WITH GRADIENT
      // ========================================
      const summaryY = doc.y;
      this.drawSummaryCard(doc, transactions, summaryY);

      doc.y = summaryY + 160;

      // ========================================
      // STATISTICS CARDS
      // ========================================
      this.drawProfessionalStatsList(doc, transactions);

      // ========================================
      // TRANSACTIONS TABLE
      // ========================================
      doc.addPage();
      this.drawTransactionsTable(doc, transactions);

      // ========================================
      // FOOTER ON ALL PAGES
      // ========================================
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        this.drawFooter(doc, i + 1, pages.count);
      }

      doc.end();
      this.logger.log('✓ PDF export completed successfully');
    } catch (error) {
      this.logger.error(`Failed to export PDF: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to export PDF');
    }
  }

  /**
   * Draw professional header with logo area
   */
  private drawHeader(doc: any, title: string, logoPath: string, bgColor: string = '#1a1a2e'): void {
    const pageWidth = 612; // A4 width
    const headerHeight = 100;

    // Header background
    doc.rect(0, 0, pageWidth, headerHeight).fill(bgColor);

    const logoX = 40;  // left margin
    const logoY = 25;  // top margin
    const logoWidth = 50;
    const logoHeight = 50;
    try {
      doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });
    } catch (err) {
      console.warn('Logo image not found, skipping logo.', err);
    }

    // Title
    doc
      .fontSize(24)
      .fillColor('#FFFFFF')
      .font(this.getFont('bold'))
      .text(title, logoX + logoWidth + 20, 35);

    // Subtitle with decorative line
    const subtitleY = 65;
    // doc
    //   .moveTo(logoX + logoWidth + 20, subtitleY - 5)
    //   .lineTo(pageWidth - 50, subtitleY - 5)
    //   .lineWidth(0.5)
    //   .strokeColor('#FFFFFF') // line color, match text
    //   .stroke();

    doc
      .fontSize(10)
      .fillColor('#CCCCCC')
      .font(this.getFont('regular'))
      .text(
        `Generated on ${new Date().toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        })}`,
        logoX + logoWidth + 20,
        subtitleY
      );

    // Bottom border line
    doc
      .moveTo(0, headerHeight - 2)
      .lineTo(pageWidth, headerHeight - 2)
      .lineWidth(1)
      .strokeColor('#E0E0E0')
      .stroke();

    doc.y = headerHeight + 20; // reset Y position after header
  }



  /**
   * Draw summary card with gradient effect
   */
  private drawSummaryCard(doc: any, transactions: any[], startY: number): void {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Card shadow
    // doc.rect(52, startY + 2, 510, 145).fill('#E0E0E0');

    // Card background with gradient effect (simulate with layers)
    // doc.rect(50, startY, 510, 145).fill('#FFFFFF');
    doc.rect(50, startY, 510, 4).fill('#4A90E2'); // Top border accent

    // Card title
    doc
      .fontSize(16)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Financial Summary', 70, startY + 20);

    // Divider line
    doc
      .moveTo(70, startY + 45)
      .lineTo(540, startY + 45)
      .strokeColor('#E8E8E8')
      .stroke();

    // Summary items with icons (using Unicode symbols)
    const items = [
      {
        icon: '↑',
        label: 'Total Income',
        value: totalIncome,
        color: '#27AE60',
        iconBg: '#D5F4E6',
        x: 70,
      },
      {
        icon: '↓',
        label: 'Total Expense',
        value: totalExpense,
        color: '#E74C3C',
        iconBg: '#FADBD8',
        x: 280,
      },
      {
        icon: '=',
        label: 'Net Balance',
        value: netBalance,
        color: netBalance >= 0 ? '#27AE60' : '#E74C3C',
        iconBg: netBalance >= 0 ? '#D5F4E6' : '#FADBD8',
        x: 70,
      },
    ];

    const CARD_TEXT_WIDTH = 180;
    let yPos = startY + 60;

    items.slice(0, 2).forEach((item) => {
      /** ICON CIRCLE */
      doc.circle(item.x + 18, yPos + 18, 18).fill(item.iconBg);

      /** ICON TEXT (CENTERED SAFELY) */
      doc
        .font(this.getFont('bold'))
        .fontSize(16)
        .fillColor(item.color)
        .text(item.icon, item.x + 9, yPos + 8, {
          width: 18,
          align: 'center',
        });

      const textX = item.x + 45;
      let currentY = yPos + 4;

      /** LABEL */
      doc
        .font(this.getFont('regular'))
        .fontSize(11)
        .fillColor('#7F8C8D')
        .lineGap(2)
        .text(item.label, textX, currentY, {
          width: CARD_TEXT_WIDTH,
        });

      /** MOVE BELOW LABEL */
      currentY = doc.y + 4;

      /** VALUE */
      doc
        .font(this.getFont('bold'))
        .fontSize(18)
        .fillColor(item.color)
        .text(
          `RWF ${item.value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`,
          textX,
          currentY,
          {
            width: CARD_TEXT_WIDTH,
          },
        );
    });

    // Net balance (full width, bottom)
    yPos = startY + 120;
    const netItem = items[2];

    doc.circle(85, yPos + 18, 18).fill(netItem.iconBg);
    doc
      .fontSize(16)
      .fillColor(netItem.color)
      .font(this.getFont('bold'))
      .text(netItem.icon, 79, yPos + 9);

    doc
      .fontSize(12)
      .fillColor('#2C3E50')
      .font(this.getFont('medium'))
      .text(netItem.label, 115, yPos + 8);

    doc
      .fontSize(19)
      .fillColor(netItem.color)
      .font(this.getFont('bold'))
      .text(
        `RWF ${netItem.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        380,
        yPos + 8,
      );
  }

  /**
   * Draw statistics cards
   */
  private drawProfessionalStatsList(doc: any, transactions: any[]): void {
    doc.moveDown(1);

    const stats = [
      {
        label: 'Total Transactions',
        value: transactions.length.toString(),
        color: '#3498DB',
      },
      {
        label: 'Income Count',
        value: transactions.filter((t) => t.type === 'income').length.toString(),
        color: '#27AE60',
      },
      {
        label: 'Expense Count',
        value: transactions.filter((t) => t.type === 'expense').length.toString(),
        color: '#E74C3C',
      },
      {
        label: 'Avg Transaction',
        value: `RWF ${(
          transactions.reduce((sum, t) => sum + t.amount, 0) /
          (transactions.length || 1)
        ).toFixed(2)}`,
        color: '#9B59B6',
      },
    ];

    const startX = 50;
    let currentY = doc.y;

    const cardWidth = 300;
    const cardPadding = 15;
    const bottomExtraPadding = 20; // increase bottom space
    const cardHeight = stats.length * 25 + cardPadding * 2 + bottomExtraPadding;

    // Draw card background
    doc
      .roundedRect(startX, currentY, cardWidth, cardHeight, 10)
      .fillColor('#FFFFFF')
      .fill();

    // Draw subtle border
    doc
      .roundedRect(startX, currentY, cardWidth, cardHeight, 10)
      .strokeColor('#E0E0E0')
      .lineWidth(1)
      .stroke();

    // Draw card title
    doc
      .fontSize(14)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Statistics Summary', startX + cardPadding, currentY + cardPadding);

    currentY += cardPadding + 25; // move below title

    // Draw stats
    stats.forEach((stat) => {
      // Colored bullet
      doc
        .circle(startX + cardPadding + 5, currentY + 6, 5)
        .fillColor(stat.color)
        .fill();

      // Label and value
      doc
        .fontSize(12)
        .fillColor('#34495E')
        .font(this.getFont('regular'))
        .text(`${stat.label}: `, startX + cardPadding + 15, currentY, { continued: true });

      doc
        .fillColor(stat.color)
        .text(stat.value);

      currentY += 25; // spacing between stats
    });

    doc.y = currentY + cardPadding + bottomExtraPadding; // leave extra space after card
  }





  /**
   * Draw professional transactions table with zebra striping
   */
  private drawTransactionsTable(doc: any, transactions: any[]): void {
    // Section title
    doc
      .fillColor('#2C3E50')
      .fontSize(18)
      .font(this.getFont('bold'))
      .text('Transaction Details', 50, 50);

    doc.moveDown(1);

    const tableTop = doc.y;
    const tableHeaders = [
      { label: 'Date', width: 75 },
      { label: 'Description', width: 160 },
      { label: 'Type', width: 55 },
      { label: 'Category', width: 80 },
      { label: 'Amount', width: 75 },
      { label: 'Account', width: 65 },
    ];

    let currentX = 50;
    const rowHeight = 35;
    const headerHeight = 30;

    // Draw header background with gradient effect
    doc.rect(50, tableTop, 510, headerHeight).fill('#f9fafb');

    // Draw headers
    tableHeaders.forEach((header) => {
      doc
        .fillColor('#6b7280')
        .fontSize(10)
        .font(this.getFont('bold'))
        .text(header.label, currentX + 8, tableTop + 10, {
          width: header.width - 16,
          align: 'left',
        });
      currentX += header.width;
    });

    let currentY = tableTop + headerHeight;
    const pageHeight = 720; // Leave space for footer
    let rowIndex = 0;

    // Draw rows with zebra striping and hover effect
    transactions.forEach((transaction) => {
      if (currentY + rowHeight > pageHeight) {
        doc.addPage();
        currentY = 50;

        currentX = 50;
        doc.rect(50, currentY, 510, headerHeight);

        tableHeaders.forEach((header) => {
          doc
            .fillColor('#FFFFFF')
            .fontSize(10)
            .font(this.getFont('bold'))
            .text(header.label, currentX + 8, currentY + 10, {
              width: header.width - 16,
              align: 'left',
            });
          currentX += header.width;
        });

        currentY += headerHeight;
      }

      // Zebra striping
      const rowColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
      doc.rect(50, currentY, 510, rowHeight)

      // Subtle border
      doc.rect(50, currentY, 510, rowHeight).strokeColor('#fff').stroke();

      currentX = 50;
      const textY = currentY + 12;

      // Date
      doc
        .fillColor('#2C3E50')
        .fontSize(9)
        .font(this.getFont('regular'))
        .text(
          new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: '2-digit',
          }),
          currentX + 8,
          textY,
          { width: tableHeaders[0].width - 16 },
        );
      currentX += tableHeaders[0].width;

      // Description (truncate if too long)
      const description =
        transaction.description.length > 38
          ? transaction.description.substring(0, 35) + '...'
          : transaction.description;
      doc
        .fillColor('#2C3E50')
        .font(this.getFont('regular'))
        .text(description, currentX + 8, textY, {
          width: tableHeaders[1].width - 16,
          lineBreak: false,
        });
      currentX += tableHeaders[1].width;

      // Type badge
      const typeColor = transaction.type === 'income' ? '#27AE60' : '#E74C3C';
      const typeBg = transaction.type === 'income' ? '#D5F4E6' : '#FADBD8';

      doc.rect(currentX + 5, currentY + 8, 45, 20).fill(typeBg);

      doc
        .fillColor(typeColor)
        .fontSize(8)
        .font(this.getFont('bold'))
        .text(transaction.type.toUpperCase(), currentX + 8, currentY + 13, {
          width: tableHeaders[2].width - 16,
          align: 'center',
        });
      currentX += tableHeaders[2].width;

      // Category
      doc
        .fillColor('#5A5A5A')
        .fontSize(9)
        .font(this.getFont('regular'))
        .text(transaction.category, currentX + 8, textY, {
          width: tableHeaders[3].width - 16,
        });
      currentX += tableHeaders[3].width;

      // Amount with color
      const amountColor = transaction.type === 'income' ? '#27AE60' : '#E74C3C';
      doc
        .fillColor(amountColor)
        .fontSize(8)
        .font(this.getFont('regular'))
        .text(
          `RWF ${transaction.amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`,
          currentX + 8,
          textY,
          { width: tableHeaders[4].width - 16 },
        );
      currentX += tableHeaders[4].width;

      // Account
      doc
        .fillColor('#7F8C8D')
        .fontSize(8)
        .font(this.getFont('regular'))
        .text(
          transaction.account.name.length > 12
            ? transaction.account.name.substring(0, 10) + '..'
            : transaction.account.name,
          currentX + 8,
          textY,
          { width: tableHeaders[5].width - 16 },
        );

      currentY += rowHeight;
      rowIndex++;
    });
  }

  /**
   * Draw professional footer
   */
  private drawFooter(doc: any, pageNumber: number, totalPages: number): void {
    const footerY = 770;

    // Footer line
    doc
      .moveTo(50, footerY)
      .lineTo(560, footerY)
      .strokeColor('#E0E0E0')
      .stroke();

    // Page number
    doc
      .fontSize(9)
      .fillColor('#7F8C8D')
      .font(this.getFont('regular'))
      .text(`Page ${pageNumber} of ${totalPages}`, 50, footerY + 10, {
        align: 'center',
        width: 510,
      });

    // Footer text
    // doc
    //   .fontSize(8)
    //   .fillColor('#A0A0A0')
    //   .text('Financial Management System - Confidential', 50, footerY + 25, {
    //     align: 'center',
    //     width: 510,
    //   });
  }

  /**
   * Build transaction filters
   */
  private buildTransactionFilters(filters: any): any {
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.accountId) where.accountId = filters.accountId;
    if (filters.category) where.category = { contains: filters.category };
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    return where;
  }

  /**
   * Export transactions to Excel with professional design
   */
  async exportTransactionsToExcel(filters: any, res: Response): Promise<void> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: this.buildTransactionFilters(filters),
        include: {
          account: true,
          member: true,
        },
        orderBy: { date: 'desc' },
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Financial Management System';
      workbook.created = new Date();
      workbook.modified = new Date();

      // ========================================
      // SUMMARY SHEET
      // ========================================
      const summarySheet = workbook.addWorksheet('Summary', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
        properties: { tabColor: { argb: 'FF4A90E2' } },
      });

      this.createExcelSummarySheet(summarySheet, transactions);

      // ========================================
      // TRANSACTIONS SHEET
      // ========================================
      const transactionsSheet = workbook.addWorksheet('Transactions', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        properties: { tabColor: { argb: 'FF27AE60' } },
      });

      this.createExcelTransactionsSheet(transactionsSheet, transactions);

      // ========================================
      // ANALYTICS SHEET
      // ========================================
      const analyticsSheet = workbook.addWorksheet('Analytics', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        properties: { tabColor: { argb: 'FFE74C3C' } },
      });

      this.createExcelAnalyticsSheet(analyticsSheet, transactions);

      // Send response
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=transactions-${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();

      this.logger.log('✓ Excel export completed successfully');
    } catch (error) {
      this.logger.error(
        `Failed to export Excel: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to export Excel');
    }
  }

  /**
   * Create Excel Summary Sheet
   */
  private createExcelSummarySheet(sheet: any, transactions: any[]): void {
    // Calculate metrics
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const incomeCount = transactions.filter((t) => t.type === 'income').length;
    const expenseCount = transactions.filter(
      (t) => t.type === 'expense',
    ).length;

    // Header Section
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'FINANCIAL SUMMARY REPORT';
    titleCell.font = {
      name: 'DM Sans',
      size: 18,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A2E' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 35;

    // Date row
    sheet.mergeCells('A2:E2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Generated: ${new Date().toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })}`;
    dateCell.font = { name: 'DM Sans', size: 10, color: { argb: 'FF7F8C8D' } };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 20;

    // Empty row
    sheet.getRow(3).height = 10;

    // Key Metrics Cards
    const metricsStartRow = 4;

    // Income Card
    this.createExcelMetricCard(
      sheet,
      'A',
      metricsStartRow,
      'TOTAL INCOME',
      totalIncome,
      'FF27AE60',
      'FFD5F4E6',
      `${incomeCount} transactions`,
    );

    // Expense Card
    this.createExcelMetricCard(
      sheet,
      'C',
      metricsStartRow,
      'TOTAL EXPENSE',
      totalExpense,
      'FFE74C3C',
      'FFFADBD8',
      `${expenseCount} transactions`,
    );

    // Net Balance Card (full width)
    const netRow = metricsStartRow + 5;
    sheet.mergeCells(`A${netRow}:E${netRow}`);
    sheet.mergeCells(`A${netRow + 1}:E${netRow + 1}`);
    sheet.mergeCells(`A${netRow + 2}:E${netRow + 2}`);

    const netLabelCell = sheet.getCell(`A${netRow}`);
    netLabelCell.value = 'NET BALANCE';
    netLabelCell.font = {
      name: 'DM Sans',
      size: 12,
      bold: true,
      color: { argb: 'FF2C3E50' },
    };
    netLabelCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const netValueCell = sheet.getCell(`A${netRow + 1}`);
    netValueCell.value = netBalance;
    netValueCell.numFmt = '$#,##0.00';
    netValueCell.font = {
      name: 'DM Sans',
      size: 24,
      bold: true,
      color: { argb: netBalance >= 0 ? 'FF27AE60' : 'FFE74C3C' },
    };
    netValueCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const netDescCell = sheet.getCell(`A${netRow + 2}`);
    netDescCell.value =
      netBalance >= 0 ? 'Positive cash flow ✓' : 'Negative cash flow ⚠';
    netDescCell.font = {
      name: 'DM Sans',
      size: 10,
      italic: true,
      color: { argb: 'FF7F8C8D' },
    };
    netDescCell.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.getRow(netRow).height = 20;
    sheet.getRow(netRow + 1).height = 35;
    sheet.getRow(netRow + 2).height = 18;

    for (let i = netRow; i <= netRow + 2; i++) {
      for (let col = 1; col <= 5; col++) {
        sheet.getCell(i, col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' },
        };
        sheet.getCell(i, col).border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
      }
    }

    // Set column widths
    sheet.getColumn('A').width = 18;
    sheet.getColumn('B').width = 18;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 18;
    sheet.getColumn('E').width = 18;
  }

  /**
   * Create metric card in Excel
   */
  private createExcelMetricCard(
    sheet: any,
    startCol: string,
    startRow: number,
    label: string,
    value: number,
    valueColor: string,
    bgColor: string,
    description: string,
  ): void {
    const endCol = startCol === 'A' ? 'B' : 'D';

    // Merge cells for card
    sheet.mergeCells(`${startCol}${startRow}:${endCol}${startRow}`);
    sheet.mergeCells(`${startCol}${startRow + 1}:${endCol}${startRow + 1}`);
    sheet.mergeCells(`${startCol}${startRow + 2}:${endCol}${startRow + 2}`);

    // Label
    const labelCell = sheet.getCell(`${startCol}${startRow}`);
    labelCell.value = label;
    labelCell.font = {
      name: 'DM Sans',
      size: 10,
      bold: true,
      color: { argb: 'FF2C3E50' },
    };
    labelCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Value
    const valueCell = sheet.getCell(`${startCol}${startRow + 1}`);
    valueCell.value = value;
    valueCell.numFmt = '$#,##0.00';
    valueCell.font = {
      name: 'DM Sans',
      size: 18,
      bold: true,
      color: { argb: valueColor },
    };
    valueCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Description
    const descCell = sheet.getCell(`${startCol}${startRow + 2}`);
    descCell.value = description;
    descCell.font = { name: 'DM Sans', size: 9, color: { argb: 'FF7F8C8D' } };
    descCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Set row heights
    sheet.getRow(startRow).height = 20;
    sheet.getRow(startRow + 1).height = 30;
    sheet.getRow(startRow + 2).height = 18;

    // Apply background and borders
    for (let i = startRow; i <= startRow + 2; i++) {
      const startColNum = startCol.charCodeAt(0) - 64;
      const endColNum = endCol.charCodeAt(0) - 64;

      for (let col = startColNum; col <= endColNum; col++) {
        const cell = sheet.getCell(i, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
      }
    }
  }

  /**
   * Create Excel Transactions Sheet
   */
  private createExcelTransactionsSheet(sheet: any, transactions: any[]): void {
    // Define columns
    sheet.columns = [
      { header: 'Date', key: 'date', width: 13 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Method', key: 'paymentMethod', width: 16 },
      { header: 'Account', key: 'account', width: 20 },
      { header: 'Member', key: 'member', width: 25 },
      { header: 'Reference', key: 'reference', width: 18 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.font = {
      name: 'DM Sans',
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11,
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF34495E' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add borders to header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF2C3E50' } },
        left: { style: 'thin', color: { argb: 'FF2C3E50' } },
        bottom: { style: 'thin', color: { argb: 'FF2C3E50' } },
        right: { style: 'thin', color: { argb: 'FF2C3E50' } },
      };
    });

    // Add data rows with alternating colors
    transactions.forEach((transaction, index) => {
      const row = sheet.addRow({
        date: new Date(transaction.date),
        description: transaction.description,
        type: transaction.type.toUpperCase(),
        category: transaction.category,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod || 'N/A',
        account: transaction.account.name,
        member: transaction.member
          ? `${transaction.member.firstName} ${transaction.member.lastName}`
          : 'N/A',
        reference: transaction.reference || 'N/A',
      });

      // Row styling
      row.height = 25;
      row.font = { name: 'DM Sans', size: 10 };
      row.alignment = { vertical: 'middle' };

      // Zebra striping
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' },
          };
        });
      }

      // Style specific cells
      const typeCell = row.getCell('type');
      typeCell.font = {
        name: 'DM Sans',
        bold: true,
        size: 10,
        color: {
          argb: transaction.type === 'income' ? 'FF27AE60' : 'FFE74C3C',
        },
      };
      typeCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const amountCell = row.getCell('amount');
      amountCell.numFmt = '$#,##0.00';
      amountCell.font = {
        name: 'DM Sans',
        bold: true,
        size: 11,
        color: {
          argb: transaction.type === 'income' ? 'FF27AE60' : 'FFE74C3C',
        },
      };
      amountCell.alignment = { vertical: 'middle', horizontal: 'right' };

      const dateCell = row.getCell('date');
      dateCell.numFmt = 'mmm dd, yyyy';

      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
      });
    });

    // Add auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: 'I1',
    };

    // Freeze panes
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }

  /**
   * Create Excel Analytics Sheet
   */
  private createExcelAnalyticsSheet(sheet: any, transactions: any[]): void {
    // Title
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'TRANSACTION ANALYTICS';
    titleCell.font = {
      name: 'DM Sans',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF34495E' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 30;

    // Category breakdown
    const categoryMap = new Map<
      string,
      { income: number; expense: number; count: number }
    >();

    transactions.forEach((tx) => {
      const category = tx.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { income: 0, expense: 0, count: 0 });
      }
      const data = categoryMap.get(category)!;
      if (tx.type === 'income') {
        data.income += tx.amount;
      } else {
        data.expense += tx.amount;
      }
      data.count++;
    });

    sheet.getCell('A3').value = 'Category Breakdown';
    sheet.getCell('A3').font = { name: 'DM Sans', size: 12, bold: true };

    sheet.getRow(4).values = [
      'Category',
      'Income',
      'Expense',
      'Net',
      'Transactions',
    ];
    sheet.getRow(4).font = { name: 'DM Sans', bold: true };
    sheet.getRow(4).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4F8' },
    };

    let row = 5;
    Array.from(categoryMap.entries())
      .sort((a, b) => b[1].income + b[1].expense - (a[1].income + a[1].expense))
      .forEach(([category, data]) => {
        const dataRow = sheet.getRow(row);
        dataRow.values = [
          category,
          data.income,
          data.expense,
          data.income - data.expense,
          data.count,
        ];
        dataRow.font = { name: 'DM Sans' };

        dataRow.getCell(2).numFmt = '$#,##0.00';
        dataRow.getCell(2).font = {
          name: 'DM Sans',
          color: { argb: 'FF27AE60' },
        };

        dataRow.getCell(3).numFmt = '$#,##0.00';
        dataRow.getCell(3).font = {
          name: 'DM Sans',
          color: { argb: 'FFE74C3C' },
        };

        const netCell = dataRow.getCell(4);
        netCell.numFmt = '$#,##0.00';
        netCell.font = {
          name: 'DM Sans',
          bold: true,
          color: {
            argb: data.income - data.expense >= 0 ? 'FF27AE60' : 'FFE74C3C',
          },
        };

        row++;
      });

    // Set column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 15;
  }

  /**
   * Export financial report (PDF)
   */
  async exportFinancialReport(
    startDate: string,
    endDate: string,
    res: Response,
    format: 'pdf' | 'excel',
  ): Promise<void> {
    try {
      const [transactions, accounts, payments, expenses, invoices] =
        await Promise.all([
          this.prisma.transaction.findMany({
            where: {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          }),
          this.prisma.financialAccount.findMany(),
          this.prisma.payment.findMany({
            where: {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          }),
          this.prisma.expense.findMany({
            where: {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          }),
          this.prisma.invoice.findMany({
            where: {
              issuedAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          }),
        ]);

      if (format === 'pdf') {
        await this.generateFinancialReportPDF(
          { transactions, accounts, payments, expenses, invoices },
          startDate,
          endDate,
          res,
        );
      } else {
        await this.generateFinancialReportExcel(
          { transactions, accounts, payments, expenses, invoices },
          startDate,
          endDate,
          res,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to export financial report: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to export financial report',
      );
    }
  }

  /**
   * Generate comprehensive financial report PDF
   */
  private async generateFinancialReportPDF(
    data: any,
    startDate: string,
    endDate: string,
    res: Response,
  ): Promise<void> {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      autoFirstPage: false,
    });

    this.registerFonts(doc);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financial-report-${Date.now()}.pdf`,
    );

    doc.pipe(res);

    // Add first page
    doc.addPage();

    // ========================================
    // HEADER
    // ========================================
    // this.drawHeader(doc, 'Comprehensive Financial Report');

    // Period subtitle
    doc
      .fontSize(12)
      .fillColor('#7F8C8D')
      .font(this.getFont('medium'))
      .text(
        `Reporting Period: ${new Date(startDate).toLocaleDateString('en-US', { dateStyle: 'long' })} - ${new Date(endDate).toLocaleDateString('en-US', { dateStyle: 'long' })}`,
        50,
        doc.y,
        { align: 'center', width: 510 },
      );

    doc.moveDown(2);

    // ========================================
    // EXECUTIVE SUMMARY
    // ========================================
    const totalIncome = data.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpense = data.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalBalance = data.accounts.reduce(
      (sum: number, acc: any) => sum + acc.balance,
      0,
    );
    const netIncome = totalIncome - totalExpense;

    const summaryY = doc.y;

    // Executive Summary Card
    doc.rect(52, summaryY + 2, 510, 180).fill('#E0E0E0'); // Shadow
    doc.rect(50, summaryY, 510, 180).fill('#FFFFFF');
    doc.rect(50, summaryY, 510, 4).fill('#4A90E2');

    doc
      .fontSize(18)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Executive Summary', 70, summaryY + 20);

    doc
      .moveTo(70, summaryY + 48)
      .lineTo(540, summaryY + 48)
      .strokeColor('#E8E8E8')
      .stroke();

    // Metrics in two columns
    let yPos = summaryY + 65;
    const col1X = 70;
    const col2X = 310;

    // Row 1: Total Assets & Net Income
    doc.fontSize(11).fillColor('#7F8C8D').font(this.getFont('regular'));
    doc.text('Total Assets', col1X, yPos);
    doc.text('Net Income', col2X, yPos);

    doc
      .fontSize(20)
      .fillColor('#3498DB')
      .font(this.getFont('bold'))
      .text(
        `${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        col1X,
        yPos + 18,
      );

    doc
      .fillColor(netIncome >= 0 ? '#27AE60' : '#E74C3C')
      .text(
        `${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        col2X,
        yPos + 18,
      );

    yPos += 50;

    // Row 2: Total Income & Total Expenses
    doc.fontSize(11).fillColor('#7F8C8D').font(this.getFont('regular'));
    doc.text('Total Income', col1X, yPos);
    doc.text('Total Expenses', col2X, yPos);

    doc
      .fontSize(16)
      .fillColor('#27AE60')
      .font(this.getFont('bold'))
      .text(
        `${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        col1X,
        yPos + 18,
      );

    doc
      .fillColor('#E74C3C')
      .text(
        `${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        col2X,
        yPos + 18,
      );

    doc.y = summaryY + 200;

    // ========================================
    // ACCOUNT BALANCES SECTION
    // ========================================
    doc
      .fontSize(16)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Account Balances', 50, doc.y);

    doc.moveDown(1);

    if (data.accounts.length > 0) {
      //   this.drawAccountsTable(doc, data.accounts);
    } else {
      doc
        .fontSize(10)
        .fillColor('#7F8C8D')
        .font(this.getFont('regular'))
        .text('No accounts found for this period.', 70, doc.y);
    }

    // ========================================
    // ACTIVITY SUMMARY
    // ========================================
    doc.addPage();

    doc
      .fontSize(18)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Activity Summary', 50, 50);

    doc.moveDown(1.5);

    const activityY = doc.y;
    const activityCards = [
      {
        label: 'Transactions',
        value: data.transactions.length,
        color: '#3498DB',
        bgColor: '#E8F4F8',
      },
      {
        label: 'Payments',
        value: `${data.payments.filter((p: any) => p.status === 'Paid').length}/${data.payments.length}`,
        color: '#27AE60',
        bgColor: '#D5F4E6',
      },
      {
        label: 'Invoices',
        value: `${data.invoices.filter((i: any) => i.status === 'Paid').length}/${data.invoices.length}`,
        color: '#E67E22',
        bgColor: '#FCE5CD',
      },
      {
        label: 'Expenses',
        value: `${data.expenses.filter((e: any) => e.status === 'Paid').length}/${data.expenses.length}`,
        color: '#E74C3C',
        bgColor: '#FADBD8',
      },
    ];

    const cardWidth = 120;
    const cardHeight = 80;
    let cardX = 50;

    activityCards.forEach((card) => {
      // Card background
      doc.rect(cardX, activityY, cardWidth, cardHeight).fill(card.bgColor);
      doc.rect(cardX, activityY, cardWidth, 3).fill(card.color);

      // Value
      doc
        .fontSize(24)
        .fillColor(card.color)
        .font(this.getFont('bold'))
        .text(card.value.toString(), cardX + 10, activityY + 20, {
          width: cardWidth - 20,
          align: 'center',
        });

      // Label
      doc
        .fontSize(10)
        .fillColor('#2C3E50')
        .font(this.getFont('regular'))
        .text(card.label, cardX + 10, activityY + 55, {
          width: cardWidth - 20,
          align: 'center',
        });

      cardX += cardWidth + 15;
    });

    doc.y = activityY + cardHeight + 30;

    // ========================================
    // PAYMENT STATUS BREAKDOWN
    // ========================================
    doc
      .fontSize(16)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Payment Status Breakdown', 50, doc.y);

    doc.moveDown(1);

    const paymentStats = {
      paid: data.payments.filter((p: any) => p.status === 'Paid').length,
      unpaid: data.payments.filter((p: any) => p.status === 'Unpaid').length,
      partial: data.payments.filter((p: any) => p.status === 'Partial').length,
    };

    const statsY = doc.y;
    doc
      .fontSize(11)
      .fillColor('#2C3E50')
      .font(this.getFont('regular'))
      .text(`Paid: ${paymentStats.paid}`, 70, statsY);
    doc.text(`Unpaid: ${paymentStats.unpaid}`, 70, statsY + 20);
    doc.text(`Partial: ${paymentStats.partial}`, 70, statsY + 40);

    // ========================================
    // EXPENSE STATUS BREAKDOWN
    // ========================================
    doc.moveDown(3);

    doc
      .fontSize(16)
      .fillColor('#2C3E50')
      .font(this.getFont('bold'))
      .text('Expense Status Breakdown', 50, doc.y);

    doc.moveDown(1);

    const expenseStats = {
      draft: data.expenses.filter((e: any) => e.status === 'Draft').length,
      submitted: data.expenses.filter((e: any) => e.status === 'Submitted')
        .length,
      approved: data.expenses.filter((e: any) => e.status === 'Approved')
        .length,
      rejected: data.expenses.filter((e: any) => e.status === 'Rejected')
        .length,
      paid: data.expenses.filter((e: any) => e.status === 'Paid').length,
    };

    const expenseY = doc.y;
    doc
      .fontSize(11)
      .fillColor('#2C3E50')
      .font(this.getFont('regular'))
      .text(`Draft: ${expenseStats.draft}`, 70, expenseY);
    doc.text(`Submitted: ${expenseStats.submitted}`, 70, expenseY + 20);
    doc.text(`Approved: ${expenseStats.approved}`, 70, expenseY + 40);
    doc.text(`Rejected: ${expenseStats.rejected}`, 70, expenseY + 60);
    doc.text(`Paid: ${expenseStats.paid}`, 70, expenseY + 80);

    // Add footers to all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, pages.count);
    }

    doc.end();
  }

  /**
   * Generate comprehensive financial report Excel
   */
  private async generateFinancialReportExcel(
    data: any,
    startDate: string,
    endDate: string,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Financial Management System';
    workbook.created = new Date();

    // Calculate metrics
    const totalIncome = data.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpense = data.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalBalance = data.accounts.reduce(
      (sum: number, acc: any) => sum + acc.balance,
      0,
    );
    const netIncome = totalIncome - totalExpense;

    // ========================================
    // EXECUTIVE SUMMARY SHEET
    // ========================================
    const summarySheet = workbook.addWorksheet('Executive Summary', {
      properties: { tabColor: { argb: 'FF4A90E2' } },
    });

    // Title
    summarySheet.mergeCells('A1:E1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'COMPREHENSIVE FINANCIAL REPORT';
    titleCell.font = {
      name: 'DM Sans',
      size: 20,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A2E' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getRow(1).height = 40;

    // Period
    summarySheet.mergeCells('A2:E2');
    const periodCell = summarySheet.getCell('A2');
    periodCell.value = `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    periodCell.font = {
      name: 'DM Sans',
      size: 11,
      color: { argb: 'FF7F8C8D' },
    };
    periodCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getRow(2).height = 22;

    summarySheet.getRow(3).height = 10;

    // Key Metrics
    this.createExcelMetricCard(
      summarySheet,
      'A',
      4,
      'TOTAL ASSETS',
      totalBalance,
      'FF3498DB',
      'FFE8F4F8',
      `${data.accounts.length} accounts`,
    );

    this.createExcelMetricCard(
      summarySheet,
      'C',
      4,
      'NET INCOME',
      netIncome,
      netIncome >= 0 ? 'FF27AE60' : 'FFE74C3C',
      netIncome >= 0 ? 'FFD5F4E6' : 'FFFADBD8',
      'This period',
    );

    this.createExcelMetricCard(
      summarySheet,
      'A',
      9,
      'TOTAL INCOME',
      totalIncome,
      'FF27AE60',
      'FFD5F4E6',
      `${data.transactions.filter((t: any) => t.type === 'income').length} transactions`,
    );

    this.createExcelMetricCard(
      summarySheet,
      'C',
      9,
      'TOTAL EXPENSES',
      totalExpense,
      'FFE74C3C',
      'FFFADBD8',
      `${data.transactions.filter((t: any) => t.type === 'expense').length} transactions`,
    );

    // Set column widths
    summarySheet.columns = [
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ];

    // ========================================
    // ACCOUNTS SHEET
    // ========================================
    const accountsSheet = workbook.addWorksheet('Accounts', {
      properties: { tabColor: { argb: 'FF27AE60' } },
    });

    accountsSheet.columns = [
      { header: 'Account Name', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 18 },
      { header: 'Balance', key: 'balance', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Style header
    accountsSheet.getRow(1).font = {
      name: 'DM Sans',
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    accountsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF34495E' },
    };
    accountsSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    accountsSheet.getRow(1).height = 28;

    // Add data
    data.accounts.forEach((account: any, index: number) => {
      const row = accountsSheet.addRow({
        name: account.name,
        type: account.type,
        balance: account.balance,
        status: account.balance >= 0 ? 'Healthy' : 'Negative',
      });

      row.font = { name: 'DM Sans' };
      row.height = 25;

      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' },
          };
        });
      }

      const balanceCell = row.getCell('balance');
      balanceCell.numFmt = '$#,##0.00';
      balanceCell.font = {
        name: 'DM Sans',
        bold: true,
        color: { argb: account.balance >= 0 ? 'FF27AE60' : 'FFE74C3C' },
      };
      balanceCell.alignment = { horizontal: 'right' };

      const statusCell = row.getCell('status');
      statusCell.font = {
        name: 'DM Sans',
        bold: true,
        color: { argb: account.balance >= 0 ? 'FF27AE60' : 'FFE74C3C' },
      };
      statusCell.alignment = { horizontal: 'center' };
    });

    // ========================================
    // ACTIVITY SHEET
    // ========================================
    const activitySheet = workbook.addWorksheet('Activity Summary', {
      properties: { tabColor: { argb: 'FFE67E22' } },
    });

    activitySheet.mergeCells('A1:C1');
    activitySheet.getCell('A1').value = 'ACTIVITY SUMMARY';
    activitySheet.getCell('A1').font = {
      name: 'DM Sans',
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    activitySheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF34495E' },
    };
    activitySheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    activitySheet.getRow(1).height = 32;

    activitySheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Count', key: 'count', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
    ];

    activitySheet.getRow(3).font = { name: 'DM Sans', bold: true };
    activitySheet.getRow(3).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4F8' },
    };

    // Add activity data
    const activities = [
      {
        category: 'Total Transactions',
        count: data.transactions.length,
        status: 'All types',
      },
      {
        category: 'Payments',
        count: data.payments.length,
        status: `${data.payments.filter((p: any) => p.status === 'Paid').length} paid`,
      },
      {
        category: 'Invoices',
        count: data.invoices.length,
        status: `${data.invoices.filter((i: any) => i.status === 'Paid').length} paid`,
      },
      {
        category: 'Expenses',
        count: data.expenses.length,
        status: `${data.expenses.filter((e: any) => e.status === 'Paid').length} paid`,
      },
    ];

    activities.forEach((activity, index) => {
      const row = activitySheet.addRow(activity);
      row.font = { name: 'DM Sans' };

      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' },
          };
        });
      }
    });

    // Send response
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financial-report-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
