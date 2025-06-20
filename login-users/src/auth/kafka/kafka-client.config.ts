import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { KafkaServices } from './kafka-constants';

export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: KafkaServices.USER_LOGIN_SERVICE,
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'auth-service-login', brokers: ['localhost:9092'] },
      consumer: { groupId: 'auth-service-login-group' },
    },
  },
];
