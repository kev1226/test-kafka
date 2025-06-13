import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/users');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       clientId: 'update-user',
  //       brokers: ['localhost:9092'],
  //     },
  //     consumer: {
  //       groupId: 'update-user-group-client',
  //     },
  //   },
  // });

  // await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3004);
}
bootstrap();
