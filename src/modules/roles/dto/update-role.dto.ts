import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ description: 'The name of the role' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to this role',
    type: [String],
    example: ['123123', '345345'],
  })
  @IsOptional()
  @IsArray()
  permissionsId?: string[];

  @ApiPropertyOptional({
    description: 'The level of the role',
    type: String,
    example: 'low',
  })
  @IsOptional()
  @IsString()
  level?: string;
}
