// import {
//   createParamDecorator,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { IUserRequest } from 'src/interfaces';
// import { User } from 'src/modules/users/entities';

// export const GetUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): User => {
//     const request = ctx.switchToHttp().getRequest<IUserRequest>();
//     const user = request.user;

//     if (!user || !user.id) {
//       throw new UnauthorizedException(
//         'User not authenticated or user ID not found',
//       );
//     }

//     return user;
//   },
// );
