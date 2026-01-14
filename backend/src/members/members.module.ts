import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PasswordOptionalForAdminPipe } from '@/pipe/password-optional-for-admin.pipe';
import { AuthModule } from '@/auth/auth.module';
import { FileUploadService } from '@/file-manager/file-upload.service';

@Module({
  controllers: [MembersController],
  imports: [AuthModule],
  providers: [MembersService, PasswordOptionalForAdminPipe, FileUploadService],
})
export class MembersModule {}
