import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

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
    description: 'Date of birth',
    example: '1990-01-01',
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  dob: Date;

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
  @IsString()
  departmentId: string;
}
