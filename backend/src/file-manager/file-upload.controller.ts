// file-upload.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { HostUrl } from '@/pipe/hostname.pipe';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @HostUrl() hosturl: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    this.fileUploadService.validateFile(file);
    const fileInfo = this.fileUploadService.getFileInfo(file, hosturl);

    return {
      message: 'File uploaded successfully',
      file: fileInfo,
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    this.fileUploadService.validateFiles(files);

    return {
      message: 'Files uploaded successfully',
      files: this.fileUploadService.getFilesInfo(files),
      count: files.length,
    };
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }
    const filepath = `./uploads/${filename}`;
    await this.fileUploadService.deleteFile(filepath);
    return {
      message: 'File deleted successfully',
      filename,
    };
  }

  @Get(':filename')
  getFileInfo(@Param('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }
    const filepath = `./uploads/${filename}`;

    return {
      message: 'File info retrieved successfully',
      filename,
    };
  }
}

// Example usage in another module:
/*
// app.module.ts
import { Module } from '@nestjs/common';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    FileUploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}

// Using in your controller:
import { FileUploadService } from './file-upload/file-upload.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      this.fileUploadService.validateFile(file);
      const fileInfo = this.fileUploadService.getFileInfo(file);
      createPostDto.image = fileInfo.url;
    }
    // Save post logic...
  }
}
*/
