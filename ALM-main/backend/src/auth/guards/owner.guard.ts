import { UserRole } from '@/generated/prisma-client/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AccountOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string; email: string; role: UserRole };
    if (user.role === 'ADMIN') {
      return true;
    }
    
    try {
      const ExistUser = await this.prisma.member.findUnique({
        where: { id: user.id, role: user.role },
        select: { id: true, status: true },
      });
      if (!user || !ExistUser) {
        throw new ForbiddenException('Access denied');
      }
      if (ExistUser.status === 'Pending') {
        throw new UnauthorizedException('Your account is not approved yet');
      }

      if (user.id !== ExistUser.id) {
        throw new ForbiddenException('You are not the owner of this account');
      }
      return true;
    } catch (error) {
      throw new ForbiddenException('Access denied');
    }
  }
}
