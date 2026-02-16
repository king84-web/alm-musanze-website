import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import {
  ApproveExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from './dto/create-expense.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('requestedBy') requestedBy?: string,
  ) {
    return this.expensesService.findAll({ status, requestedBy });
  }

  @Get('pending')
  findPending() {
    return this.expensesService.findPending();
  }

  @Get('summary')
  getSummary() {
    return this.expensesService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string) {
    return this.expensesService.submit(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() approveDto: ApproveExpenseDto) {
    return this.expensesService.approve(id, approveDto.approvedBy);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() approveDto: ApproveExpenseDto) {
    return this.expensesService.reject(id, approveDto.approvedBy);
  }

  @Patch(':id/mark-paid')
  markAsPaid(@Param('id') id: string, @Query('accountId') accountId: string) {
    return this.expensesService.markAsPaid(id, accountId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
