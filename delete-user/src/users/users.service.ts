import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async remove(id: number) {
    // 1. Verificar que el usuario exista y no esté ya eliminado
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 2. Eliminar lógicamente
    await this.userRepository.softDelete(id);

    return { message: `User with ID ${id} was deleted successfully` };
  }
}
