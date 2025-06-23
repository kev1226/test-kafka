import * as jwt from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import {
  TokenValidationRequest,
  TokenValidationRequestWithOrigin,
  TokenValidationResponse,
} from './auth.interface';
import { KafkaServices } from 'src/kafka/kafka-constants';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @Inject(KafkaServices.AUTH_VERIFIER_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}
  private readonly secret = 'kalemat2025';

  validateToken(data: TokenValidationRequest): TokenValidationResponse {
    try {
      const token = data.token.replace('Bearer ', '');
      const decoded = jwt.verify(token, this.secret) as any;

      const roles = Array.isArray(decoded.roles)
        ? decoded.roles
        : [decoded.roles];

      if (
        data.requiredRoles &&
        !roles.includes('admin') &&
        !data.requiredRoles.some((r) => roles.includes(r))
      ) {
        return { isValid: false, error: 'Forbidden: role not allowed' };
      }

      return { isValid: true, payload: { ...decoded, roles } };
    } catch (err) {
      return { isValid: false, error: err.message };
    }
  }

  async validateTokenAndRespond(
    data: TokenValidationRequestWithOrigin,
  ): Promise<void> {
    console.log('📥 Solicitud recibida para validar token y responder');
    console.log('🔍 Datos recibidos:', JSON.stringify(data));

    const result = this.validateToken(data);
    const topic =
      data.origin === 'cart'
        ? 'auth.verify.response.cart'
        : 'auth.verify.response';

    console.log('📨 Topic destino:', topic);

    if (!result.isValid) {
      console.warn('❌ Token inválido:', result.error);
      await this.kafkaClient
        .emit(topic, {
          valid: false,
          error: result.error,
        })
        .toPromise();
      return;
    }

    const payload = result.payload;

    console.log('✅ Token válido. Payload decodificado:', payload);

    await this.kafkaClient
      .emit(topic, {
        valid: true,
        userId: payload.id || payload.sub,
        email: payload.email,
        roles: payload.roles,
      })
      .toPromise();

    console.log('📤 Respuesta enviada por Kafka al topic:', topic);
  }
}
