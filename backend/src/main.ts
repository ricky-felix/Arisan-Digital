import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Payment-gateway webhooks are public, gateway-facing endpoints that live at
  // /webhooks/* (see BillingModule). Exclude them from the global /api prefix so
  // their URLs match what Xendit/Midtrans are configured to call.
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'webhooks/xendit', method: RequestMethod.POST },
      { path: 'webhooks/midtrans', method: RequestMethod.POST },
    ],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
}
bootstrap();
