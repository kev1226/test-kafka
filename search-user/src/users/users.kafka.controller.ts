import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { KafkaTopics } from '../kafka/kafka-topics.enum';

@Controller()
export class UsersKafkaController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(KafkaTopics.GET_USER_BY_ID)
  async handleGetUserById(@Payload() id: number) {
    try {
      const user = await this.usersService.findOne(id);
      const { id: userId, name, email, role } = user;
      return { id: userId, name, email, role };
    } catch {
      return null;
    }
  }

  @MessagePattern(KafkaTopics.GET_USER_BY_EMAIL)
  async handleGetUserByEmail(@Payload() email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      const { id, name, email: userEmail, role } = user;
      return { id, name, email: userEmail, role };
    } catch {
      return null;
    }
  }

  @MessagePattern(KafkaTopics.GET_USER_BY_EMAIL_WITH_PASSWORD)
  async handleGetUserWithPassword(@Payload() email: string) {
    try {
      const user = await this.usersService.findByEmailWithPassword(email);
      return { data: user };
    } catch {
      return { error: 'Usuario no encontrado' };
    }
  }

  @MessagePattern(KafkaTopics.PROFILE_USER)
  async handleGetProfile(@Payload() payload: { email: string; role: string }) {
    try {
      const user = await this.usersService.findOneByEmail(payload.email);
      return { data: { name: user.name, email: user.email } };
    } catch {
      return { error: 'Usuario no encontrado' };
    }
  }
}
