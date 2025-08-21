import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro Max',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features and larger screen',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 1199.99,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
    required: false,
  })
  category?: string;
}
