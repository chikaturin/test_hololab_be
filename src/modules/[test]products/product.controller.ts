import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from './dto/index.dto';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Return all products',
    type: [ProductResponseDto],
  })
  getProducts(): ProductResponseDto[] {
    return this.productService.getProducts();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBearerAuth('accessToken')
  @ApiHeader({ name: 'refreshToken', description: 'Refresh token' })
  @ApiHeader({ name: 'sessionId', description: 'Session ID' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  createProducts(
    @Body(new ValidationPipe({ transform: true }))
    createProductDto: CreateProductDto,
  ): ProductResponseDto {
    try {
      return this.productService.createProduct(createProductDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Return product by ID',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductById(@Param('id') id: string): ProductResponseDto | null {
    return this.productService.getProductById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateProductById(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): ProductResponseDto | null {
    console.log('Updating product:', id, updateProductDto);
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  deleteProductById(@Param('id') id: string): { success: boolean } {
    const result = this.productService.deleteProduct(id);
    return { success: result };
  }
}
