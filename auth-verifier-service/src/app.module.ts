import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientConfig } from './kafka/kafka-client.config';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [ClientsModule.register(kafkaClientConfig)],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
