import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientConfig } from 'src/kafka/kafka-client.config';

@Module({
  imports: [
    ClientsModule.register(kafkaClientConfig),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporting UsersService to be used in other modules
})
export class UsersModule {}
