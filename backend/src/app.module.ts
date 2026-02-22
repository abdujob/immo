import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PropertyModule,
    AgencyModule,
    FavoriteModule,
    ContactModule,
    SearchModule,
    ReviewModule,
    ContactModule,
    SearchModule,
    ReviewModule,
    UploadsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
