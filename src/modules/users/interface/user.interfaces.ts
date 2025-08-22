import { User } from '../entities/user.entity';

export interface UserRequest extends Request {
  user: User;
}
