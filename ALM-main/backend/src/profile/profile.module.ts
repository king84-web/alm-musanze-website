import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { ProfileService } from './profile.service';

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [PrismaService, ProfileService],
})
export class ProfileModule {}
