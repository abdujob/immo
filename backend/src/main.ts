import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Normalize by removing trailing slash for strict CORS matching
  const origin = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

  app.enableCors({
    origin: [origin, 'http://localhost:3000'],
    credentials: true,
  });

  // Use Helmet
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // Global Validation
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Platiny API')
    .setDescription('The Platiny API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start on port 4000
  await app.listen(process.env.PORT || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
