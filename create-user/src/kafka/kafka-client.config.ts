import { ClientsModuleOptions, Transport } from '@nestjs/microservices';

export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: 'USER_SEARCH_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'create-user',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'create-user-group',
      },
    },
  },
];
