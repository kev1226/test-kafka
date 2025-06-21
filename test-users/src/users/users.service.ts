import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
    // return `This action adds a new user`;
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
    // return `This action returns a user with email ${email}`;
  }

  findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'],
    });
  }

  findAll() {
    return this.userRepository.find();
    // return `This action returns all users`;
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
    // return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
    // return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return this.userRepository.softDelete(id);
    // return `This action removes a #${id} user`;
  }
}
