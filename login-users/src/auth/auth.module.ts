import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientConfig } from 'src/kafka/kafka-client.config';

@Module({
  imports: [ClientsModule.register(kafkaClientConfig)],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
