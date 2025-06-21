import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ name, email, password }: RegisterDto) {
    // Logic for user registration
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('User with this email already exists');
    }
    await this.usersService.create({
      name,
      email,
      password: await bcryptjs.hash(password, 10),
    });

    return {
      name,
      email,
    };
  }

  async login({ email, password }: LoginDto) {
    // Logic for user login
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate JWT token
    // Assuming you have a JWT secret defined in your configuration
    const payload = { email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      email,
    };
  }

  async profile({ email, role }: { email: string; role: string }) {
    // Logic to get user profile
    return await this.usersService.findOneByEmail(email);
  }
}
