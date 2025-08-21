import { Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from './dto/index.dto';

@Injectable()
export class ProductService {
  private products: ProductResponseDto[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features',
      price: 999.99,
      category: 'Electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'MacBook Pro M3',
      description: 'Powerful laptop for professionals',
      price: 1999.99,
      category: 'Electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  getProducts(): ProductResponseDto[] {
    return this.products;
  }

  getProductById(id: string): ProductResponseDto | null {
    return this.products.find((product) => product.id === id) || null;
  }

  createProduct(createProductDto: CreateProductDto): ProductResponseDto {
    const newProduct: ProductResponseDto = {
      id: (this.products.length + 1).toString(),
      name: createProductDto.name,
      description: createProductDto.description || '',
      price: createProductDto.price,
      category: createProductDto.category || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): ProductResponseDto | null {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) {
      return null;
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateProductDto,
      updatedAt: new Date(),
    };

    return this.products[productIndex];
  }

  deleteProduct(id: string): boolean {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) {
      return false;
    }

    this.products.splice(productIndex, 1);
    return true;
  }
}
