import {
  Inject,
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { LoginDto } from './dto/login.dto';
import { KafkaServices } from './kafka/kafka-constants';
import { KafkaTopics } from './kafka/kafka-topics.enum';

interface UserWithPassword {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

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
    let response: { data?: UserWithPassword; error?: string };

    try {
      response = await firstValueFrom(
        this.kafkaClient
          .send<{
            data?: UserWithPassword;
            error?: string;
          }>(KafkaTopics.GET_USER_BY_EMAIL_WITH_PASSWORD, email)
          .pipe(timeout(this.TIMEOUT)),
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new ServiceUnavailableException('Timeout del microservicio');
      }
      throw new ServiceUnavailableException('Error en la comunicación');
    }

    if (!response?.data) {
      throw new UnauthorizedException(
        response?.error || 'Usuario no encontrado',
      );
    }

    const user = response.data;
    const valid = await bcryptjs.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const token = await this.jwtService.signAsync({
      email: user.email,
      roles: user.role,
    });

    return { token, email: user.email };
  }
}
