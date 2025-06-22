import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { KafkaServices } from './kafka-constants';

export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: KafkaServices.AUTH_VERIFIER_SERVICE,
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'list-user-client', brokers: ['localhost:9092'] },
      consumer: { groupId: 'list-user-group' },
    },
  },
];
