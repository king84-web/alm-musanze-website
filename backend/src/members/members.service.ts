import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberDto } from './dto/member.dto';
import { MemberStatus } from '@/generated/prisma-client/client';
import { FileUploadService } from '@/file-manager/file-upload.service';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async findAll(filter?: { status?: MemberStatus }) {
    try {
      const members = await this.prisma.member.findMany({
        where: filter?.status ? { status: filter.status } : {},
        omit: {
          password: true,
        },
        include: {
          emergencyContact: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return members;
    } catch (error) {
      console.error('Find All Members Error:', error);
      throw new InternalServerErrorException('Failed to load members.');
    }
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        emergencyContact: true,
        documents: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const { password, ...result } = member;
    return result;
  }

  async update(id: string, data: UpdateMemberDto) {
    let oldAvatarPath: string | null = null;
    try {
      const existing = await this.prisma.member.findUnique({ where: { id } });

      if (!existing) {
        throw new NotFoundException('Member not found');
      }
      const memberAvatar = await this.prisma.member.findUnique({
        where: { id },
        select: { avatar: true },
      });
      oldAvatarPath = memberAvatar?.avatar || null;

      const { password, emergencyContact, documents, ...updateData } =
        data as any;

      // Clean incoming emergency contact data
      const cleanEmergencyContact = emergencyContact
        ? Object.fromEntries(
            Object.entries(emergencyContact).filter(([, v]) => v !== undefined),
          )
        : null;

      const member = await this.prisma.member.update({
        where: { id },

        data: {
          ...updateData,

          ...(cleanEmergencyContact && {
            emergencyContact: {
              update: {
                where: { memberId: id },
                data: {
                  // Remove forbidden keys such as memberId
                  ...cleanEmergencyContact,
                  memberId: undefined, // explicitly remove if present
                },
              },
            },
          }),
        },

        omit: {
          password: true,
        },
        include: {
          emergencyContact: true,
          documents: true,
        },
      });

      if (data.avatar && memberAvatar?.avatar !== data.avatar) {
        const filename = oldAvatarPath?.split('/').pop();
        const url = filename ? `./uploads/${filename}` : '';

        if (oldAvatarPath) {
          await this.fileUploadService.deleteFile(url!);
        }
      }
      return member;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email or Membership ID already in use');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Member not found');
      }

      console.error('Update Member Error:', error);
      throw new InternalServerErrorException('Failed to update member');
    }
  }

  async delete(id: string) {
    await this.prisma.member.delete({ where: { id } });
    return { message: 'Member deleted successfully' };
  }
}
