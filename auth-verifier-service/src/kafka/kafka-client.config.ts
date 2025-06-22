import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { KafkaServices } from './kafka-constants';
import { KafkaTopics } from './kafka-topics.enum';

export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: KafkaServices.AUTH_VERIFIER_SERVICE,
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-verifier-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'auth-verifier-group',
      },
    },
  },
];
