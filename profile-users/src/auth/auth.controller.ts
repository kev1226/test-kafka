import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../common/enums/rol.enum';
import { Auth } from '../common/decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user-decorator';
import { UserActiveInterface } from 'src/common/interface/user-active.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @Auth(Role.USER) // Assuming you have a Role enum with USER defined
  profile(@ActiveUser() user: UserActiveInterface) {
    return this.authService.profile(user);
  }
}
