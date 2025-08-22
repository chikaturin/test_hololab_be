import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPermissionsDto {
  @ApiProperty({
    description: 'Module of the permissions',
    type: String,
    example: 'users',
  })
  @IsString()
  module: string;

  @ApiProperty({
    description: 'Name of the permissions',
    type: String,
    example: 'create',
  })
  @IsString()
  name: string;
}
