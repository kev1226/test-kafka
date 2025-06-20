import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
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

  private readonly RPC_TIMEOUT = 5000;

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.CREATE_USER);
    await this.kafkaClient.connect();
  }

  async register(dto: RegisterDto) {
    const password = await bcryptjs.hash(dto.password.trim(), 10);

    const payload = {
      name: dto.name.trim(),
      email: dto.email.trim(),
      password,
    };

    const created = await this.callRpc<{ name: string; email: string }>(
      KafkaTopics.CREATE_USER,
      payload,
    );

    return created; // { name, email }
  }

  private async callRpc<T>(topic: KafkaTopics, payload: any): Promise<T> {
    let reply: { data?: T; error?: string };

    // 1) Solo la llamada y el timeout dentro del try
    try {
      reply = await firstValueFrom(
        this.kafkaClient
          .send<{ data?: T; error?: string }>(topic, payload)
          .pipe(timeout(this.RPC_TIMEOUT)),
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new ServiceUnavailableException(
          'El servicio de usuarios no respondió a tiempo',
        );
      }
      throw new ServiceUnavailableException(
        'No se pudo conectar con el servicio de usuarios',
      );
    }

    // 2) Validaciones de negocio FUERA del try, para que no las atrape
    if (reply.error) {
      // aquí cae tu BadRequestException para email duplicado
      throw new BadRequestException(reply.error);
    }
    if (!reply.data) {
      throw new BadRequestException(
        'Respuesta inválida del servicio de usuarios',
      );
    }

    return reply.data;
  }
}
