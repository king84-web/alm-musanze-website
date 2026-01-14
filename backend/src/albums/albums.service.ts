import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.album.create({ data });
  }

  async findAll() {
    return this.prisma.album.findMany({
      include: {
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.album.findUnique({
      where: { id },
      include: {
        photos: {
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async addPhoto(albumId: string, data: any) {
    const photo = await this.prisma.photo.create({
      data: { ...data, albumId },
    });

    await this.prisma.album.update({
      where: { id: albumId },
      data: { photoCount: { increment: 1 } },
    });

    return photo;
  }

  async delete(id: string) {
    await this.prisma.album.delete({ where: { id } });
    return { message: 'Album deleted successfully' };
  }
}