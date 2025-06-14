import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientConfig } from 'src/kafka/kafka-client.config';
import { UsersKafkaController } from './users.kafka.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register(kafkaClientConfig),
  ],
  controllers: [UsersController, UsersKafkaController],
  providers: [UsersService],
  exports: [UsersService], // Exporting UsersService to be used in other modules
})
export class UsersModule {}
