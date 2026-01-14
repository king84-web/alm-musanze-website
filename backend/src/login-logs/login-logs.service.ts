import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoginLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: { role?: string; status?: string }) {
    return this.prisma.loginLog.findMany({
      where: {
        ...(filter?.role && { role: filter.role as any }),
        ...(filter?.status && { status: filter.status }),
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}


