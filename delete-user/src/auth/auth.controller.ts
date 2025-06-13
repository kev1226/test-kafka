import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { Role } from '../common/enums/rol.enum';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user-decorator';
import { UserActiveInterface } from 'src/common/interface/user-active.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    // Logic for user registration
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    // Logic for user login
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @Auth(Role.USER) // Assuming you have a Role enum with USER defined
  profile(@ActiveUser() user: UserActiveInterface) {
    return this.authService.profile(user);
  }
}
