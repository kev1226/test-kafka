import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import {
  TokenValidationRequest,
  TokenValidationResponse,
} from './auth.interface';

@Injectable()
export class AuthService {
  private readonly secret = 'kalemat2025';

  validateToken(data: TokenValidationRequest): TokenValidationResponse {
    try {
      const token = data.token.replace('Bearer ', '');
      const payload = jwt.verify(token, this.secret);

      if (
        data.requiredRoles &&
        !data.requiredRoles.some((role) => payload['roles']?.includes(role))
      ) {
        return { isValid: false, error: 'Forbidden: role not allowed' };
      }

      return { isValid: true, payload };
    } catch (err) {
      return { isValid: false, error: err.message };
    }
  }
}
