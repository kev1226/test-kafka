import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { KafkaServices } from 'src/kafka/kafka-constants';
import { KafkaTopics } from 'src/kafka/kafka-topics.enum';

@Injectable()
export class AuthService {
  private readonly TIMEOUT = 5000;

  constructor(
    @Inject(KafkaServices.USER_PROFILE_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.PROFILE_USER);
    await this.kafkaClient.connect();
  }

  async profile({ email, role }: { email: string; role: string }) {
    const payload = {
      email: email.trim(),
      role: role.trim(),
    };

    try {
      const { data, error } = await firstValueFrom(
        this.kafkaClient
          .send<{
            data?: { name: string; email: string };
            error?: string;
          }>(KafkaTopics.PROFILE_USER, payload)
          .pipe(timeout(this.TIMEOUT)),
      );

      if (!data) {
        throw new ServiceUnavailableException(error || 'Sin data received');
      }

      return data;
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new ServiceUnavailableException('Request timed out');
      }
      throw new ServiceUnavailableException('Service Unavailable');
    }
  }
}
