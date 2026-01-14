import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    subject: string;
    message: string;
    sender: string;
    email: string;
    memberId?: string;
  }) {
    return this.prisma.feedback.create({ data });
  }

  async findAll(filter?: { status?: string }) {
    return this.prisma.feedback.findMany({
      where: filter?.status ? { status: filter.status as any } : {},
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.feedback.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async reply(id: string) {
    return this.prisma.feedback.update({
      where: { id },
      data: { status: 'Replied', isRead: true },
    });
  }

  async archive(id: string) {
    return this.prisma.feedback.update({
      where: { id },
      data: { status: 'Archived', isRead: true },
    });
  }

  async delete(id: string) {
    await this.prisma.feedback.delete({ where: { id } });
    return { message: 'Feedback deleted successfully' };
  }

  async getUnreadCount() {
    const count = await this.prisma.feedback.count({
      where: { isRead: false },
    });
    return { count };
  }
}