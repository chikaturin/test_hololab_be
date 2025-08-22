import { IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Role name' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example: 'Administrator role',
    description: 'Role description',
  })
  @IsString()
  @MaxLength(255)
  description: string;
}
