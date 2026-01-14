// file-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class FileUploadService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  validateFiles(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    files.forEach((file) => this.validateFile(file));
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    } catch (error) {
      console.error(`Error deleting file: ${filepath}`, error);
    }
  }

  getFileInfo(file: Express.Multer.File, hosturl?: string) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      url: `${hosturl}/uploads/${file.filename}`,
    };
  }

  getFilesInfo(files: Express.Multer.File[]) {
    return files.map((file) => this.getFileInfo(file));
  }
}
