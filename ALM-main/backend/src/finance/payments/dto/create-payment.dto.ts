import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsDateString,
  IsEmail,
} from 'class-validator';
import {
  PayerType,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
} from '@/generated/prisma-client/client';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  memberId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentPurpose)
  @IsNotEmpty()
  purpose: PaymentPurpose;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PayerType, {
    message: 'Please Specify a who is making the payment',
  })
  @IsNotEmpty()
  payerType: PayerType;

  @IsString()
  @IsOptional()
  payerName?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  payerEmail?: string;

  @IsString()
  @IsOptional()
  payerPhone?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
  @IsUUID()
  @IsOptional()
  invoiceId?: string;
}

export class UpdatePaymentDto {
  @IsString()
  @IsOptional()
  memberId?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsEnum(PaymentPurpose)
  @IsOptional()
  purpose?: PaymentPurpose;

  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
