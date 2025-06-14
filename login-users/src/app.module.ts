import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { kafkaClientConfig } from './kafka/kafka-client.config';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
