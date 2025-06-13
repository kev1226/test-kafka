import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { KafkaTopics } from '../kafka/kafka-topics.enum';
import { User } from './entities/user.entity';

@Controller()
export class UsersKafkaController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern(KafkaTopics.GET_USER_BY_ID)
  async handleGetUserById(@Payload() id: number) {
    try {
      console.log('📩 Recibido get-user-by-id:', id);
      const user = await this.usersService.findOne(id);
      console.log('✔️ Usuario encontrado:', user);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        deleteAd: user.deleteAd,
      };
    } catch (error) {
      console.error('❌ Error buscando usuario por ID:', error.message);
      return null;
    }
  }

  @EventPattern(KafkaTopics.GET_USER_BY_EMAIL)
  async handleGetUserByEmail(@Payload() email: string) {
    try {
      console.log('📩 Recibido get-user-by-email:', email);
      const user = await this.usersService.findOneByEmail(email);
      console.log('✔️ Usuario encontrado por email:', user);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        deleteAd: user.deleteAd,
      };
    } catch (error) {
      console.error('❌ Error buscando usuario por email:', error.message);
      return null;
    }
  }

  @EventPattern(KafkaTopics.GET_USER_BY_EMAIL_WITH_PASSWORD)
  async handleGetUserWithPassword(@Payload() email: string) {
    try {
      console.log('📩 Recibido get-user-by-email-with-password:', email);
      const user = await this.usersService.findByEmailWithPassword(email);
      console.log('✔️ Usuario con contraseña:', user);
      // Devuelve también la contraseña solo en este caso
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        deleteAd: user.deleteAd,
      };
    } catch (error) {
      console.error('❌ Error buscando usuario con contraseña:', error.message);
      return null;
    }
  }
}
