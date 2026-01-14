import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterMemberDto } from '@/members/dto/member.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TransformPipe } from '@/pipe/transform.pipe';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body(
      new TransformPipe(RegisterMemberDto, [''], {
        profession: 'occupation ',
      }),
    )
    dto: RegisterMemberDto,
    @Request() req,
  ) {
    const ip = this.authService.getClientIp(req);
    return this.authService.register(dto, ip);
  }

  @Post('login')
  async login(
    @Body()
    dto: {
      email: string;
      password: string;
      role?: 'MEMBER' | 'ADMIN';
    },
    @Request() req,
  ) {
    const ip = this.authService.getClientIp(req);
    return this.authService.login(dto, ip);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    const ip = this.authService.getClientIp(req);
    return this.authService.logout(req.user.sub, ip);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: { resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() dto: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.sub,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req) {
    const token = await this.authService.refreshToken(
      req.user.sub,
      req.user.email,
      req.user.role,
    );
    return { token };
  }

  @Get('login-history')
  @UseGuards(JwtAuthGuard)
  async getLoginHistory(@Request() req, @Query('limit') limit?: string) {
    return this.authService.getLoginHistory(
      req.user.sub,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return req.user;
  }
}
