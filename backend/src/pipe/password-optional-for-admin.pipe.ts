import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { RegisterMemberDto } from '@/members/dto/member.dto';

@Injectable()
export class PasswordOptionalForAdminPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const RequestBy = value?.RequestBy;

    if (!RequestBy) {
      throw new BadRequestException('Unauthorized: user not found');
    }

    const isAdmin = RequestBy === 'ADMIN';

    if (!isAdmin && !value.password) {
      throw new BadRequestException('Password is required for normal users');
    }

    if (isAdmin && !value.password) {
      value.password = require('crypto').randomBytes(8).toString('hex');
    }
    const { RequestBy: _, joinDate, ...rest } = value;

    return {
      ...rest,
    };
  }
}
