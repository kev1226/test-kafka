import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcryptjs from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { KafkaServices } from '../kafka/kafka-constants';
import { KafkaTopics } from '../kafka/kafka-topics.enum';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(KafkaServices.USER_CREATE_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.CREATE_USER);
    await this.kafkaClient.connect();
  }

  async register(dto: RegisterDto) {
    const hashed = await bcryptjs.hash(dto.password.trim(), 10);

    const created = await firstValueFrom(
      this.kafkaClient.send(KafkaTopics.CREATE_USER, {
        name: dto.name.trim(),
        email: dto.email.trim(),
        password: hashed,
      }),
    );

    if (!created) {
      throw new BadRequestException('No se pudo crear el usuario');
    }

    return { name: created.name, email: created.email };
  }
}
