import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Post,
  Req,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, Roles } from '../auth/decorators/roles.decorator';
import { RegisterMemberDto, UpdateMemberDto } from './dto/member.dto';
import { MemberStatus } from '@/generated/prisma-client/client';
import { AuthService } from '@/auth/auth.service';
import { PasswordOptionalForAdminPipe } from '@/pipe/password-optional-for-admin.pipe';
import { HostUrl } from '@/pipe/hostname.pipe';
import { AccountOwnerGuard } from '@/auth/guards/owner.guard';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(
    private membersService: MembersService,
    private authService: AuthService,
  ) {}

  @Get()
  @Roles('ADMIN')
  findAll(@Query('status') status?: MemberStatus, @HostUrl() host?: string) {
    return this.membersService.findAll({ status });
  }

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(
    @Body(new PasswordOptionalForAdminPipe())
    data: Omit<RegisterMemberDto, 'password'> & { password?: string },
  ) {
    const { RequestBy, ...dta } = data;
    return this.authService.register(dta as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() data: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'ADMIN' && user.id !== id) {
      throw new Error('You can only update your own profile');
    }
    return this.membersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.membersService.delete(id);
  }

  @Put(':id/edit-profile')
  @UseGuards(AccountOwnerGuard)
  updateProfile(
    @Param('id') id: string,
    @Body() data: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'ADMIN' && user.id !== id) {
      throw new Error('You can only update your own profile');
    }
    return this.membersService.update(id, data);
  }
}
