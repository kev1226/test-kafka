import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'IGBDo4848',
      database: 'users_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
