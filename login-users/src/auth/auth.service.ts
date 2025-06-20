import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { LoginDto } from './dto/login.dto';
import { KafkaServices } from './kafka/kafka-constants';
import { KafkaTopics } from './kafka/kafka-topics.enum';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly TIMEOUT = 5000;

  constructor(
    @Inject(KafkaServices.USER_LOGIN_SERVICE)
    private readonly kafkaClient: ClientKafka,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(
      KafkaTopics.GET_USER_BY_EMAIL_WITH_PASSWORD,
    );
    await this.kafkaClient.connect();
  }

  async login({ email, password }: LoginDto) {
    const { data: user } = await firstValueFrom(
      this.kafkaClient
        .send<{ data: any }>(KafkaTopics.GET_USER_BY_EMAIL_WITH_PASSWORD, email)
        .pipe(timeout(this.TIMEOUT)),
    );

    const match = await bcryptjs.compare(password, user.password);
    if (!match) return null;

    const token = await this.jwtService.signAsync({
      email: user.email,
      role: user.role,
    });

    return { token, email: user.email };
  }
}
