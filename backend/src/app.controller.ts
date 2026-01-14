import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';

@Controller('alm')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('executive-commite')
  ExecutiveCommittee() {
    return this.appService.ExecutiveCommittee();
  }
}
