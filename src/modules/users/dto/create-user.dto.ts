import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'User type', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
