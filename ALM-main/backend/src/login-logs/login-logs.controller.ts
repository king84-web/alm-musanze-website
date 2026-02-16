import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoginLogsService } from './login-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('login-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class LoginLogsController {
  constructor(private loginLogsService: LoginLogsService) {}

  @Get()
  findAll(@Query('role') role?: string, @Query('status') status?: string) {
    return this.loginLogsService.findAll({ role, status });
  }
}