import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/index.decorators';
import { User } from 'src/modules/users/entities/user.entity';
import { TokenService } from 'src/modules/token/token.service';
import { RoleService } from 'src/modules/roles/role.service';
import { getCookie } from 'src/utils/cookie.utils';
import { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

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
      const rolePermissions = await Promise.all(
        user.userRoles.map((r) =>
          this.roleService.getRolePermissions(r.roleId),
        ),
      );
      const allPermissions = rolePermissions.flat();
      request.user = user;
      const hasPermission = requiredPermissions.every((permission) =>
        allPermissions.includes(permission),
      );
      if (!hasPermission) throw new ForbiddenException('Permission denied');
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
  private extractTokenAndSessionIdFromHeader(
    request: Request & { user?: User },
  ): { token: string; sessionId: string } | undefined {
    const sessionId = getCookie(request, 'session');
    const token = getCookie(request, 'accessToken');
    if (!sessionId || !token) return undefined;
    return { token, sessionId };
  }
}
