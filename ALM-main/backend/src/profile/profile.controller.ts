import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AccountOwnerGuard } from '@/auth/guards/owner.guard';
import { PayloadDto } from '@/@types';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @Get('me')
  @UseGuards(JwtAuthGuard, AccountOwnerGuard)
  getProfile(@CurrentUser() user: PayloadDto) {
    return this.profileService.getProfile(user);
  }
}
