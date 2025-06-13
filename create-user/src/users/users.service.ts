import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create({ name, email, password }: CreateUserDto) {
    const user = await this.userRepository.findOneBy({ email });

    if (user) {
      throw new BadRequestException('User with this email already exists');
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

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }
}
