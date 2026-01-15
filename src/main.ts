import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

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

For production use or unlimited access, please deploy your own instance.

---

### 📌 Project Links

**GitHub Repository**: [https://github.com/BehruzXurramov/PostHub-NestJS](https://github.com/BehruzXurramov/PostHub-NestJS)

**Author**: Behruz Xurramov  
**Email**: [bxurramov597@gmail.com](mailto:bxurramov597@gmail.com)

**Community**: Join our Telegram group for questions, suggestions, and issue reports  
[https://t.me/PostHubCommunity](https://t.me/PostHubCommunity)

**License**: MIT License

**Built a frontend with this API?** Share it with us in the [community](https://t.me/PostHubCommunity) 😊
`,
    )
    .setVersion('1.0')
    .addServer('https://posthub.bestapi.uz', 'Production Server')
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
    customfavIcon: '/logo.ico',
    customCss: `
  .swagger-ui .topbar {
    display: none;
  }

  .swagger-ui .info {
    margin: 30px 0;
  }

  .swagger-ui .info .title::before {
    content: '';
    display: inline-block;
    width: 48px;
    height: 48px;
    margin-right: 12px;
    background: url('/logo.png') no-repeat center;
    background-size: contain;
    vertical-align: middle;
  }

  .swagger-ui .info .title {
    font-size: 36px;
    display: flex;
    align-items: center;
  }
    `,
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);
  const NODE_ENV = configService.get<string>('NODE_ENV', 'development');
  const THE_URL = configService.get<string>('THE_URL');

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
