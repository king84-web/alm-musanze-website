import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Matches,
  IsArray,
} from 'class-validator';

/**
 * DTO for creating a new admin user
 */
export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(\+?25)?(078|079|072|073)\d{7}$/, {
    message: 'Please provide a valid Rwandan phone number',
  })
  phone: string;
}

/**
 * DTO for updating member status
 */
export class UpdateMemberStatusDto {
  @IsEnum(['Active', 'Pending', 'Rejected', 'Suspended'], {
    message: 'Status must be Active, Pending, Rejected, or Suspended',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: 'Active' | 'Pending' | 'Rejected' | 'Suspended';

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for resetting member password
 */
export class ResetMemberPasswordDto {
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

/**
 * DTO for rejecting/suspending members with reason
 */
export class ActionWithReasonDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for bulk operations
 */
export class BulkActionDto {
  @IsArray()
  @IsNotEmpty({ message: 'Member IDs are required' })
  memberIds: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for updating member details
 */
export class UpdateMemberDetailsDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: 'Male' | 'Female' | 'Other';

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  cell?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsEnum(['Regular', 'Premium', 'Lifetime', 'Executive', 'Student', 'Honorary'])
  membershipType?:
    | 'Regular'
    | 'Premium'
    | 'Lifetime'
    | 'Executive'
    | 'Student'
    | 'Honorary';

  @IsOptional()
  @IsEnum(['Paid', 'Unpaid', 'Partial'])
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partial';
}

/**
 * DTO for query filters
 */
export class MemberQueryDto {
  @IsOptional()
  @IsEnum(['Active', 'Pending', 'Rejected', 'Suspended'])
  status?: 'Active' | 'Pending' | 'Rejected' | 'Suspended';

  @IsOptional()
  @IsEnum(['MEMBER', 'ADMIN'])
  role?: 'MEMBER' | 'ADMIN';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  page?: number;
}