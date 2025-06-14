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

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.CREATE_USER);
    await this.kafkaClient.connect();
  }

  async register(dto: RegisterDto) {
    // 1) Hash de la contraseña
    const password = await bcryptjs.hash(dto.password.trim(), 10);

    // 2) Envío con timeout de 5s
    let reply: { data?: { name: string; email: string }; error?: string };
    try {
      reply = await firstValueFrom(
        this.kafkaClient
          .send(KafkaTopics.CREATE_USER, {
            name: dto.name.trim(),
            email: dto.email.trim(),
            password,
          })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        // fallo por timeout
        throw new ServiceUnavailableException(
          'El servicio de usuarios no respondió a tiempo',
        );
      }
      // cualquier otro error (por ejemplo de conexión)
      throw new ServiceUnavailableException(
        'No se pudo conectar con el servicio de usuarios',
      );
    }

    // 3) Si el servicio devolvió un error de negocio
    if (reply.error) {
      throw new BadRequestException(reply.error);
    }

    // 4) Si no viene data, también es un fallo
    if (!reply.data) {
      throw new BadRequestException(
        'Respuesta inválida del servicio de usuarios',
      );
    }

    // 5) Todo OK: devolvemos el resultado
    return reply.data;
  }
}
