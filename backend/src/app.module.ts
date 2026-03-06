import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { AgencyModule } from './agency/agency.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ContactModule } from './contact/contact.module';
import { SearchModule } from './search/search.module';
import { ReviewModule } from './review/review.module';
import { UploadsModule } from './uploads/uploads.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    AuthModule,
    PropertyModule,
    AgencyModule,
    FavoriteModule,
    ContactModule,
    SearchModule,
    ReviewModule,
    UploadsModule,
    UserModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
