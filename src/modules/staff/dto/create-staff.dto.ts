import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsMongoId,
} from 'class-validator';

export class CreateStaffDto {
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
    description: 'Date of birth',
    example: '1990-01-01',
    required: true,
  })
  @IsNotEmpty()
  dob: Date;

  @ApiProperty({
    description: 'Salary',
    example: 1000,
    required: true,
  })
  @IsNotEmpty()
  salary: number;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567890',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

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

  @ApiProperty({
    description: 'Job title',
    example: 'Software Engineer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @ApiProperty({
    description: 'Hire date',
    example: '2021-01-01',
    required: true,
  })
  @IsNotEmpty()
  hireDate: Date;

  @ApiProperty({
    description: 'Email address for user account',
    example: 'john.doe@company.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for user account',
    example: 'password123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
