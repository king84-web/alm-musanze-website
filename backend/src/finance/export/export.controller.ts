import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';
@Controller('finance/export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('transactions/pdf')
  exportPDF(@Query() filters, @Res() res: Response) {
    return this.exportService.exportTransactionsToPDF(filters, res);
  }
}
