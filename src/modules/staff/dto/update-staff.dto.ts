import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEmail,
  IsMongoId,
} from 'class-validator';

export class UpdateStaffDto {
  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567890',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Email address for user account',
    example: 'john.doe@company.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Salary',
    example: 1000,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @ApiProperty({
    description: 'Address',
    example: '123 Main St, Anytown, USA',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Department ID',
    example: '1234567890',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId({ message: 'departmentId must be a valid Mongo ObjectId' })
  departmentId: string;
}
