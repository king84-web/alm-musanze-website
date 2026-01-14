import { PayloadDto } from '@/@types';
import { Member, UserRole } from '@/generated/prisma-client/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  async getProfile(user: PayloadDto): Promise<{ user: Member }> {
    if (!Object.values(UserRole).includes(user.role as any)) {
      throw new UnauthorizedException();
    }
    try {
      const member = await this.prisma.member.findUnique({
        where: { id: user.id, role: user.role },
      });

      if (!member) {
        throw new UnauthorizedException();
      }
      return {
        user: {
          ...member,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong while fetching profile',
      );
    }
  }
}
