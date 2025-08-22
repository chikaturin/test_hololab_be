import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeletePermissionsDto {
  @ApiProperty({
    description: 'ID of the permissions',
    type: String,
    example: '',
  })
  @IsString()
  permissionId: string;

  @ApiProperty({
    description: 'ID of the roles',
    type: String,
    example: '',
  })
  @IsString()
  roleId: string;
}
