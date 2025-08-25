import { User } from 'src/modules/users/entities/user.entity';

export interface IUserRequest extends Request {
  user: User;
}
