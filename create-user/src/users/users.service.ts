import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { KafkaServices } from 'src/kafka/kafka-constants';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaTopics } from 'src/kafka/kafka-topics.enum';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(KafkaServices.USER_SEARCH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.GET_USER_BY_EMAIL);
    await this.kafkaClient.connect();
  }

  async create({ name, email, password }: CreateUserDto) {
    const existingUser = await firstValueFrom(
      this.kafkaClient.send(KafkaTopics.GET_USER_BY_EMAIL, email),
    );

    if (existingUser) {
      throw new BadRequestException('Este correo ya está registrado.');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return {
      name,
      email,
    };
  }
}
