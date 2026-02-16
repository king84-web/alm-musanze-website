import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { EventsModule } from './events/events.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AlbumsModule } from './albums/albums.module';
import { FeedbackModule } from './feedback/feedback.module';
import { LoginLogsModule } from './login-logs/login-logs.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { FileUploadModule } from './file-manager/file-upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProfileModule } from './profile/profile.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health.controller';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MembersModule,
    EventsModule,
    AnnouncementsModule,
    TransactionsModule,
    AlbumsModule,
    FeedbackModule,
    ProfileModule,
    LoginLogsModule,
    FinanceModule,
    AdminModule,
    ConfigModule.forRoot({ isGlobal: true }),
    FileUploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [PrismaService, AppService],
  controllers: [AppController, HealthController],
})
export class AppModule {}
