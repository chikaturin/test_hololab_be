import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'id', description: 'UserID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'id', description: 'RoleID' })
  @IsUUID()
  roleId: string;
}
