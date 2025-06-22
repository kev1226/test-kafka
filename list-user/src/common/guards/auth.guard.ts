import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaServices } from '../../kafka/kafka-constants';
import { KafkaTopics } from '../../kafka/kafka-topics.enum';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(KafkaServices.AUTH_VERIFIER_SERVICE)
    private readonly kafkaClient: ClientKafka,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) throw new UnauthorizedException('Token no enviado');

    const payload = {
      token,
      requiredRoles,
    };

    let result;
    try {
      result = await firstValueFrom(
        this.kafkaClient
          .send(KafkaTopics.VERIFY_TOKEN, payload)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new UnauthorizedException('Tiempo de espera agotado');
      }
      throw new UnauthorizedException('Error en la verificación');
    }

    if (!result?.isValid || !result.payload) {
      throw new ForbiddenException(result?.error || 'Token inválido');
    }

    const user = result.payload;

    // Admin siempre accede
    if (requiredRoles.length > 0 && !user.roles?.includes('admin')) {
      const tienePermiso = requiredRoles.some((r) => user.roles?.includes(r));
      if (!tienePermiso) {
        throw new ForbiddenException('No tienes el rol necesario');
      }
    }

    request['user'] = user;
    return true;
  }
}
