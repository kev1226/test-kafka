import {
  Inject,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { KafkaServices } from './kafka/kafka-constants';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaTopics } from './kafka/kafka-topics.enum';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(KafkaServices.USER_LOGIN_SERVICE)
    private readonly kafkaClient: ClientKafka,
    private readonly jwtService: JwtService,
  ) {}

  private readonly RPC_TIMEOUT = 5000;

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.LOGIN_USER);
    await this.kafkaClient.connect();
  }

  async login({ email, password }: LoginDto) {
    let user;
    try {
      user = await firstValueFrom(
        this.kafkaClient
          .send(KafkaTopics.LOGIN_USER, { email })
          .pipe(timeout(this.RPC_TIMEOUT)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new UnauthorizedException(
          'Timeout al contactar al microservicio',
        );
      }
      throw new UnauthorizedException('Usuario no encontrado o error de red');
    }

    if (!user || !user.password) {
      throw new UnauthorizedException('Usuario no existe');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      email,
    };
  }
}
