import { UserRole } from '@/generated/prisma-client/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class PayloadDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  membershipId: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
export type PaymentPurpose =
  | 'MEMBERSHIP_FEE'
  | 'SUBSCRIPTION'
  | 'DONATION'
  | 'EVENT_TICKET'
  | 'SERVICE_FEE'
  | 'PRODUCT_PURCHASE'
  | 'LOAN_REPAYMENT'
  | 'LOAN_DISBURSEMENT'
  | 'PENALTY'
  | 'FINE'
  | 'CONTRIBUTION'
  | 'INVOICE_PAYMENT'
  | 'REGISTRATION_FEE'
  | 'SYSTEM_CHARGE'
  | 'OTHER';
  
export type PaymentPurposeOption = {
  label: string;
  value: PaymentPurpose;
};

export const PAYMENT_PURPOSE_OPTIONS: PaymentPurposeOption[] = [
  { label: 'Membership Fee', value: 'MEMBERSHIP_FEE' },
  { label: 'Subscription', value: 'SUBSCRIPTION' },
  { label: 'Donation', value: 'DONATION' },
  { label: 'Event Ticket', value: 'EVENT_TICKET' },
  { label: 'Service Fee', value: 'SERVICE_FEE' },
  { label: 'Product Purchase', value: 'PRODUCT_PURCHASE' },
  { label: 'Loan Repayment', value: 'LOAN_REPAYMENT' },
  { label: 'Loan Disbursement', value: 'LOAN_DISBURSEMENT' },
  { label: 'Penalty', value: 'PENALTY' },
  { label: 'Fine', value: 'FINE' },
  { label: 'Contribution', value: 'CONTRIBUTION' },
  { label: 'Invoice Payment', value: 'INVOICE_PAYMENT' },
  { label: 'Registration Fee', value: 'REGISTRATION_FEE' },
  { label: 'System Charge', value: 'SYSTEM_CHARGE' },
  { label: 'Other', value: 'OTHER' },
];
