// Trigger redeploy: Audit of messaging and notifications completed.
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dns from 'dns';

// Force technical priority to IPv4 to fix ENETUNREACH issues on Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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

  console.log('CORS configured for:', [origin, 'http://localhost:3000', 'https://immosenegal.sn']);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        origin,
        'https://immosenegal.sn',
        'https://www.immosenegal.sn',
      ];

      if (
        !requestOrigin ||
        allowedOrigins.includes(requestOrigin) ||
        requestOrigin.endsWith('.vercel.app') ||
        requestOrigin.endsWith('.immosenegal.sn')
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${requestOrigin}`);
        callback(null, false); // Block other origins
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Cookie',
  });

  // Use Helmet
  // Use Helmet with CORS-friendly settings for media
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for now if it interferes with media blobs or cross-subdomain resources
  }));

  // Body Parser Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

  // Start on port 4000 (bind to 0.0.0.0 to force IPv4)
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
