import { Expose, Type } from 'class-transformer';

export class UserRoleDto {
  @Expose()
  role: string;
}

export class AuthResponseDto {
  @Expose()
  _id: string;

  @Expose()
  email: string;

  @Expose()
  staffId?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  @Type(() => UserRoleDto)
  userRoles: UserRoleDto[];
}
