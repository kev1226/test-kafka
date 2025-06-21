import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { KafkaServices } from './kafka-constants';

export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: KafkaServices.USER_PROFILE_SERVICE,
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'auth-service-profile', brokers: ['localhost:9092'] },
      consumer: { groupId: 'auth-service-profile-group' },
    },
  },
];
