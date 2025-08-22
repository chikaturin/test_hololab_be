import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRequest } from 'src/modules/users/interface/user.interfaces';
import { User } from 'src/modules/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User not authenticated or user ID not found',
      );
    }

    return user;
  },
);
