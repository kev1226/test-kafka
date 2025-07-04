import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersKafkaController } from './users.kafka.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, UsersKafkaController],
  providers: [UsersService],
  exports: [UsersService], // Exporting UsersService to be used in other modules
})
export class UsersModule {}
