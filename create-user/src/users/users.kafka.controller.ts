import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UsersService } from './users.service';
import { KafkaTopics } from '../kafka/kafka-topics.enum';

@Controller()
export class UsersKafkaController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(KafkaTopics.CREATE_USER)
  async handleCreateUser(
    @Payload() dto: { name: string; email: string; password: string },
  ) {
    try {
      // Llama a tu método existente de creación
      const result = await this.usersService.create(dto);
      return result;
    } catch {
      return null;
    }
  }
}
