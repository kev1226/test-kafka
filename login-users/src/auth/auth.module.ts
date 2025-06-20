import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaClientConfig } from './kafka/kafka-client.config';

@Module({
  imports: [
    ClientsModule.register(kafkaClientConfig),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret, // Secret key for signing JWTs,
      signOptions: { expiresIn: '1h' }, // Token expiration time
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
