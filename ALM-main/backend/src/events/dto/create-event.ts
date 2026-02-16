// // src/events/dto/event.dto.ts

// import { IsString } from "class-validator";

// export class CreateSpeakerDTO {
//     name!: string;
//     title!: string;
//     bio?: string;
//     photo?: string;
// }

// export class CreateAgendaItemDTO {
//     @IsString()
//     time!: string;

//     @IsString()
//     title!: string;
//     @IsString()
//     description?: string;
// }

// export class CreateAttachmentDTO {
//     name!: string;
//     url!: string;
//     type!: string;
// }

// export class CreateEventDTO {
//     title!: string;
//     description!: string;
//     date!: string;
//     time!: string;
//     location!: string;
//     category!: string;
//     status?: 'Upcoming' | 'Ongoing' | 'Completed';
//     image?: string;
//     registrationRequired?: boolean;
//     speakers?: CreateSpeakerDTO[];
//     agenda?: CreateAgendaItemDTO[];
//     attachments?: CreateAttachmentDTO[];
// }

// export class UpdateEventDTO {
//     title?: string;
//     description?: string;
//     date?: string;
//     time?: string;
//     location?: string;
//     category?: string;
//     status?: 'Upcoming' | 'Ongoing' | 'Completed';
//     image?: string;
//     registrationRequired?: boolean;
//     speakers?: CreateSpeakerDTO[];
//     agenda?: CreateAgendaItemDTO[];
//     attachments?: CreateAttachmentDTO[];
// }

// src/events/dto/event.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsBoolean,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsDateString,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// Nested DTOs
export class CreateSpeakerDTO {
  @IsString()
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @Transform(({ obj }) => obj.avatar ?? obj.photo)
  photo?: string;
}

export class CreateAgendaItemDTO {
  @IsString()
  time!: string;

  @IsString()
  activity!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAttachmentDTO {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsString()
  type!: string;
}

// Main CreateEvent DTO
export class CreateEventDTO {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Date cannot be empty' })
  date!: string;

  @IsString()
  @IsNotEmpty({ message: 'Start Time cannot be empty' })
  time!: string;

  @IsString()
  @IsNotEmpty({ message: 'Location cannot be empty' })
  location!: string;

  @IsString({ message: 'Category must string' })
  @IsNotEmpty({ message: 'Category cannot be empty' })
  category!: string;

  @IsOptional()
  @IsString()
  organizer?: string;

  @IsOptional()
  @IsEnum(['Upcoming', 'Ongoing', 'Completed'])
  status?: 'Upcoming' | 'Ongoing' | 'Completed';

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  registrationRequired?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpeakerDTO)
  speakers?: CreateSpeakerDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAgendaItemDTO)
  agenda?: CreateAgendaItemDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDTO)
  attachments?: CreateAttachmentDTO[];

  @IsNumber(
    {},
    {
      message:
        'Max Attendees must be a valid number with up to 2 decimal places',
    },
  )
  @IsOptional()
  maxAttendees?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ obj }) => obj.price ?? obj.eventfee)
  eventfee?: number;

  @IsString()
  @IsEmail({}, { message: 'Contact Email must be a valid email address' })
  contactEmail: string;
}

const toDate = ({ value }: { value: any }) => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
};

export class UpdateEventDTO extends PartialType(CreateEventDTO) {
  @IsString()
  @IsNotEmpty({ message: 'id cannot be empty' })
  id: string;

  @Transform(toDate)
  @IsDate()
  createdAt: Date;

  @Transform(toDate)
  @IsDate()
  updatedAt?: Date;
}
