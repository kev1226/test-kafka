import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { KafkaServices } from 'src/kafka/kafka-constants';
import { KafkaTopics } from 'src/kafka/kafka-topics.enum';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(KafkaServices.USER_SEARCH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.GET_USER_BY_ID);
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.GET_USER_BY_EMAIL);
    await this.kafkaClient.connect();
  }

  async update(id: number, dto: UpdateUserDto): Promise<{ message: string }> {
    let existingUser: { id: number; email: string };
    try {
      existingUser = await firstValueFrom(
        this.kafkaClient
          .send<{ id: number; email: string }>(KafkaTopics.GET_USER_BY_ID, id)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new ServiceUnavailableException(
          'El servicio de búsqueda de usuarios no respondió a tiempo',
        );
      }
      throw new ServiceUnavailableException(
        'No se pudo conectar con el servicio de búsqueda de usuarios',
      );
    }

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== existingUser.email) {
      const foundByEmail = await firstValueFrom(
        this.kafkaClient.send(KafkaTopics.GET_USER_BY_EMAIL, dto.email),
      );

      if (foundByEmail && foundByEmail.id !== id) {
        throw new ConflictException('Email already in use by another user');
      }
    }
    if (dto.password) {
      const salt = await bcryptjs.genSalt(10);
      dto.password = await bcryptjs.hash(dto.password, salt);
    }

    await this.userRepository.update(id, dto);
    return { message: 'User updated successfully' };
  }
}
