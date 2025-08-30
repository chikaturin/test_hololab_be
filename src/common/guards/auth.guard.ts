import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { TokenService } from '../../modules/token/token.service';
import { RoleService } from '../../modules/roles/role.service';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const authData = this.extractTokenAndSessionIdFromHeader(request);
    if (!authData) {
      throw new UnauthorizedException('No token or session id provided');
    }
    const { token, sessionId } = authData;

    try {
      const payload = await this.tokenService.verifyToken(token, sessionId);
      const user = await this.roleService.findUserWithRoles(payload.userId);
      if (!user || user.isActive === false) {
        throw new UnauthorizedException('User not found');
      }
      request.user = user;
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenAndSessionIdFromHeader(
    request: Request,
  ): { token: string; sessionId: string } | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const sessionId = request.headers['x-session-id'] as string;
    return type === 'Bearer' ? { token, sessionId } : undefined;
  }
}
