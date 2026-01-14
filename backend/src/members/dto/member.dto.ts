import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  isNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  ExecutiveCommitteePosition,
  Gender,
  MemberStatus,
  MembershipType,
  PaymentStatus,
} from '@/generated/prisma-client/client';

export class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  relation?: string;
}

export class RegisterMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  gender?: Gender;

  @IsNotEmpty({ message: 'dateOfBirth should not be empty' })
  @IsString({ message: 'dateOfBirth must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateOfBirth must be in YYYY-MM-DD format',
  })
  dateOfBirth: string;

  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  cell?: string;

  @IsString()
  @IsNotEmpty()
  occupation: string;

  @IsString()
  @IsNotEmpty()
  county: string;

  @IsEnum(MembershipType)
  @IsNotEmpty()
  @IsOptional()
  membershipType?: MembershipType;

  @IsOptional()
  paymentStatus?: PaymentStatus;
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @IsOptional()
  @IsString()
  RequestBy: string;

  @IsEnum(ExecutiveCommitteePosition)
  @IsOptional()
  position?: ExecutiveCommitteePosition;
}

export class UpdateMemberDto extends PartialType(RegisterMemberDto) {
  @IsOptional()
  status?: MemberStatus;
}
