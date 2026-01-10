import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(cookieParser());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('PostHub API')
    .setDescription(
      `A social media platform API for creating posts, comments, likes, and following users.

⚠️ **Important**: This API uses free hosting services (free server, free database). Under heavy load, you may experience:
- Slower response times
- Temporary unavailability
- Limited concurrent connections

For production use or unlimited access, please deploy your own instance. See the GitHub repository for instructions.`,
    )
    .setVersion('1.0')
    .setExternalDoc(
      'GitHub Repository',
      'https://github.com/BehruzXurramov/PostHub-NestJS',
    )
    .setContact(
      'PostHub API',
      'https://github.com/BehruzXurramov/PostHub-NestJS',
      'bxurramov597@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('https://api.posthub.bestapi.uz', 'Production Server')
    .addServer('http://localhost:3000', 'Local Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token (obtained from /auth/login)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh token (automatically set after login)',
    })
    .addTag(
      'Authentication',
      'User registration, login, and account management',
    )
    .addTag('Users', 'User profile operations and search')
    .addTag('Posts', 'Create, read, update, and delete posts')
    .addTag('Comments', 'Comment on posts')
    .addTag('Likes', 'Like and unlike posts')
    .addTag('Follows', 'Follow and unfollow users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'PostHub API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 36px; }
    `,
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);
  const NODE_ENV = configService.get<string>('NODE_ENV', 'development');
  const THE_URL = configService.get<string>('THE_URL')

  await app.listen(PORT, () => {
    console.log(`
Server is running...

Environment: ${NODE_ENV}
Port:        ${PORT}
API Docs:    ${THE_URL}/docs
`);
  });
}
bootstrap();
