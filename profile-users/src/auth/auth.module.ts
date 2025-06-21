import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientConfig } from 'src/kafka/kafka-client.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/common/constants/jwt.constants';

@Module({
  imports: [
    ClientsModule.register(kafkaClientConfig),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
