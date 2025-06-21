import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],

  controllers: [],
  providers: [],
})
export class AppModule {}
