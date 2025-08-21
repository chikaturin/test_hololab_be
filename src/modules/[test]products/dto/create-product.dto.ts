import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'This field must be than 5 character' })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 999.99,
    required: true,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
    required: false,
  })
  category?: string;
}
