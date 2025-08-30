import type { Request } from 'express';
import { User } from '../modules/users/entities/user.entity';

export interface IUserRequest extends Request {
  user: User;
}
