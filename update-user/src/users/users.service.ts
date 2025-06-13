import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { KafkaServices } from 'src/kafka/kafka-constants';
import { KafkaTopics } from 'src/kafka/kafka-topics.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(KafkaServices.USER_SEARCH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  // ✅ Este orden es FUNDAMENTAL
  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.GET_USER_BY_ID);
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.GET_USER_BY_EMAIL);
    await this.kafkaClient.connect();
    console.log('🟢 Kafka Client conectado y listo');
  }

  async update(id: number, dto: UpdateUserDto): Promise<{ message: string }> {
    console.log('🚀 Enviando solicitud para buscar user ID:', id);

    const existingUser = await firstValueFrom(
      this.kafkaClient.send(KafkaTopics.GET_USER_BY_ID, id),
    );

    console.log('🟢 Usuario recibido por ID desde search-user:', existingUser);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== existingUser.email) {
      const foundByEmail = await firstValueFrom(
        this.kafkaClient.send(KafkaTopics.GET_USER_BY_EMAIL, dto.email),
      );

      console.log(
        '🟠 Usuario recibido por EMAIL desde search-user:',
        foundByEmail,
      );

      if (foundByEmail && foundByEmail.id !== id) {
        throw new ConflictException('Email already in use by another user');
      }
    }

    await this.userRepository.update(id, dto);
    console.log(`✅ Usuario actualizado en base de datos con ID: ${id}`);

    return { message: 'User updated successfully' };
  }
}
