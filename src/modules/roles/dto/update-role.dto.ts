import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateRoleDto {
  @ApiProperty({ description: 'The name of the role' })
  @IsString()
  name: string;
  @ApiProperty({ description: 'The description of the role' })
  @IsString()
  description: string;
}
