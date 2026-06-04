import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';
import { AuthRequest } from './auth-request.interface';
import { KeycloakToken } from './keycloak-token.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing token');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwtDecode<KeycloakToken>(token);

      request.user = {
        userId: decoded.sub,
        username: decoded.preferred_username,
        roles: decoded.realm_access?.roles ?? [],
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
