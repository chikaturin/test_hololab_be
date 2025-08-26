import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'IT',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Department description',
    example: 'IT department',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
