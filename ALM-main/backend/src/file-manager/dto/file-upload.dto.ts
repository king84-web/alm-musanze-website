import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  file: any;
}

export class MultipleFileUploadDto {
  @IsArray()
  @IsNotEmpty()
  files: any[];
}
