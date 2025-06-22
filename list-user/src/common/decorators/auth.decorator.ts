import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'requiredRoles';

export const Auth = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
