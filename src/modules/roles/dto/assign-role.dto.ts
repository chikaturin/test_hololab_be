import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'User ID to assign role' })
  @IsString()
  @IsNotEmpty()
  userManager: string;
}
