import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterMemberDto } from '@/members/dto/member.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterMemberDto, ip?: string) {
    const existingMember = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });

    if (existingMember) {
      throw new ConflictException('Email already registered');
    }
    if (
      Object.entries(dto).some(
        ([key, value]) => value === null || value === undefined,
      )
    ) {
      throw new BadRequestException('All fields are required');
    }
    if (existingMember) {
      throw new ConflictException('Email already registered');
    }

    // Check if phone number already exists
    const existingPhone = await this.prisma.member.findFirst({
      where: { phone: dto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const membershipId = await this.generateMembershipId();
    try {
      const member = await this.prisma.member.create({
        data: {
          ...dto,
          password: hashedPassword,
          membershipId,
          status: 'Pending',

          emergencyContact: dto.emergencyContact
            ? {
                create: {
                  ...dto.emergencyContact,
                  relation: dto.emergencyContact.relation ?? '',
                },
              }
            : undefined,
        },
        omit: { password: true },
        include: { emergencyContact: true, documents: true },
      });

      await this.createLoginLog(
        member.id,
        member.email,
        'MEMBER',
        'Success',
        ip || '0.0.0.0',
        `${member.firstName} ${member.lastName}`,
      );

      const token = this.generateToken(member.id, member.email, 'MEMBER');

      return {
        member,
        token,
        message: 'Registration successful! Your account is pending approval.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(
    dto: {
      email: string;
      password: string;
      role?: 'MEMBER' | 'ADMIN';
    },
    ip?: string,
  ) {
    const role = dto.role || 'MEMBER';

    // Admin login with database check
    if (role === 'ADMIN') {
      return await this.adminLogin(dto.email, dto.password, ip);
    }

    // Member login
    try {
      const member = await this.prisma.member.findUnique({
        where: { email: dto.email },
        include: {
          emergencyContact: true,
        },
      });

      if (!member) {
        await this.createLoginLog(
          'UNKNOWN',
          dto.email,
          'MEMBER',
          'Failed',
          ip || '0.0.0.0',
          'Unknown User',
        );
        throw new NotFoundException('User not found. Please register.');
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        member.password,
      );

      if (!isPasswordValid) {
        await this.createLoginLog(
          member.id,
          member.email,
          'MEMBER',
          'Failed',
          ip || '0.0.0.0',
          `${member.firstName} ${member.lastName}`,
        );
        throw new UnauthorizedException('Incorrect password');
      }

      // Check account status
      this.validateMemberStatus(member.status);

      await this.createLoginLog(
        member.id,
        member.email,
        'MEMBER',
        'Success',
        ip || '0.0.0.0',
        `${member.firstName} ${member.lastName}`,
      );

      const token = this.generateToken(member.id, member.email, member.role);

      // Remove password from response
      const { password, ...memberData } = member;

      return {
        user: memberData,
        token,
        role: member.role,
        message: `Welcome back, ${member.firstName}!`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new InternalServerErrorException(
        'Login failed due to server error. Please try again.',
      );
    }
  }

  private async adminLogin(email: string, password: string, ip?: string) {
    // Load admin from database with ADMIN role
    const adminMember = await this.prisma.member.findUnique({
      where: {
        email: email,
        role: 'ADMIN',
      },
    });

    if (!adminMember) {
      await this.createLoginLog(
        'UNKNOWN',
        email,
        'ADMIN',
        'Failed',
        ip || '0.0.0.0',
        'Unknown Admin',
      );
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      adminMember.password,
    );

    if (!isPasswordValid) {
      await this.createLoginLog(
        adminMember.id,
        adminMember.email,
        'ADMIN',
        'Failed',
        ip || '0.0.0.0',
        `${adminMember.firstName} ${adminMember.lastName}`,
      );
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Check admin account status
    this.validateMemberStatus(adminMember.status);

    await this.createLoginLog(
      adminMember.id,
      adminMember.email,
      'ADMIN',
      'Success',
      ip || '0.0.0.0',
      `${adminMember.firstName} ${adminMember.lastName}`,
    );

    const token = this.generateToken(
      adminMember.id,
      adminMember.email,
      'ADMIN',
    );

    const { password: _, ...adminData } = adminMember;

    return {
      user: adminData,
      token,
      role: 'ADMIN',
      message: `Welcome Administrator, ${adminMember.firstName}!`,
    };
  }

  private validateMemberStatus(status: string) {
    switch (status) {
      case 'Pending':
        throw new UnauthorizedException(
          'Your account is pending approval. Please contact an administrator.',
        );
      case 'Rejected':
        throw new UnauthorizedException(
          'Your account application has been rejected. Please contact support.',
        );
      case 'Suspended':
        throw new UnauthorizedException(
          'Your account has been suspended. Please contact support.',
        );
      case 'Active':
        return true;
      default:
        throw new UnauthorizedException('Invalid account status');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshToken(userId: string, email: string, role: string) {
    return this.generateToken(userId, email, role);
  }

  async forgotPassword(email: string) {
    const member = await this.prisma.member.findUnique({
      where: { email },
    });

    if (!member) {
      // Don't reveal if email exists for security
      return {
        message:
          'If an account exists with this email, a reset link has been sent.',
      };
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = this.jwtService.sign(
      { id: member.id, type: 'password-reset' },
      { expiresIn: '1h' },
    );

    // TODO: Send email with reset link
    // For now, return token (in production, send via email)
    return {
      message: 'Password reset link has been sent to your email.',
      resetToken, // Remove this in production
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(resetToken);

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.member.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (!member) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, member.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.member.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getLoginHistory(userId: string, limit = 10) {
    return await this.prisma.loginLog.findMany({
      where: { memberId: userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async logout(userId: string, ip?: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (member) {
      await this.createLoginLog(
        userId,
        member.email,
        member.role,
        'Success',
        ip || '0.0.0.0',
        `${member.firstName} ${member.lastName}`,
      );
    }

    return { message: 'Logged out successfully' };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign(
      { id: userId, email, role },
      { expiresIn: '1h' }, // Token expires in 7 days
    );
  }

  private async generateMembershipId(): Promise<string> {
    const year = new Date().getFullYear();
    let membershipId: string;
    let exists = true;

    // Keep generating until we find a unique ID
    while (exists) {
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      membershipId = `ALM-${year}-${random}`;

      const existing = await this.prisma.member.findUnique({
        where: { membershipId },
      });

      exists = !!existing;
    }

    return membershipId!;
  }

  private async createLoginLog(
    userId: string,
    email: string,
    role: 'MEMBER' | 'ADMIN',
    status: 'Success' | 'Failed',
    ip: string,
    userName: string,
  ) {
    try {
      return await this.prisma.loginLog.create({
        data: {
          userId,
          userName,
          email,
          role,
          status,
          ip,
          memberId: role === 'MEMBER' && status === 'Success' ? userId : null,
        },
      });
    } catch (error) {
      console.error('Login log creation error:', error);
      // Don't throw error, just log it
    }
  }

  // Helper to extract IP from request
  getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.ip ||
      '0.0.0.0'
    );
  }
}
