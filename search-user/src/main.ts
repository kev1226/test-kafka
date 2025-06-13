import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/users');
  // Enable CORS for all origins

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Conexión a Kafka como microservicio
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'search-user',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'search-user-group',
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT || 3003);
}
bootstrap();
