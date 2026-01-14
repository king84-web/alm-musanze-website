import { HttpException, Injectable } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  async ExecutiveCommittee() {
    try {
      const executiveCommittee = await this.prisma.member.findMany({
        where: { position: { not: null }, membershipType: 'Executive' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          position: true,
        },
      });
      const fdata = executiveCommittee.map((item) => ({
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
        email: item.email,
        image: item.avatar,
        role: item.position,
      }));
      return fdata;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal Server Error', 500);
      }
    }
  }
}
