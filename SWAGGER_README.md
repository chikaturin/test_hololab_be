# Swagger Documentation Setup

## Cài đặt Swagger cho NestJS

Project này đã được cài đặt và cấu hình Swagger để tạo API documentation tự động.

## Các package đã cài đặt

- `@nestjs/swagger` - Core Swagger module cho NestJS
- `swagger-ui-express` - Swagger UI interface
- `@nestjs/config` - Configuration module

## Cách sử dụng

### 1. Khởi động ứng dụng

```bash
npm run start:dev
```

### 2. Truy cập Swagger UI

Sau khi khởi động ứng dụng, bạn có thể truy cập Swagger documentation tại:

**🌐 Swagger UI:** `http://localhost:3000/api`

**🚀 API Base URL:** `http://localhost:3000`

### 3. Các endpoint có sẵn

#### Products API (`/products`)

- `GET /products` - Lấy danh sách tất cả products
- `POST /products` - Tạo product mới
- `GET /products/:id` - Lấy product theo ID
- `PUT /products/:id` - Cập nhật product theo ID
- `DELETE /products/:id` - Xóa product theo ID

### 4. Test API với Swagger

1. Mở Swagger UI tại `http://localhost:3000/api`
2. Chọn endpoint bạn muốn test
3. Click "Try it out"
4. Nhập parameters (nếu có)
5. Click "Execute"

### 5. DTOs đã được định nghĩa

- `CreateProductDto` - Schema cho việc tạo product mới
- `UpdateProductDto` - Schema cho việc cập nhật product
- `ProductResponseDto` - Schema cho response của product

## Cấu hình Swagger

Swagger được cấu hình trong `src/main.ts` với:

- Title: "Test Hololab API"
- Description: "API documentation for Test Hololab project"
- Version: "1.0"
- Tags: "products", "categories"

## Thêm endpoint mới

Để thêm endpoint mới với Swagger documentation:

1. Sử dụng các decorator từ `@nestjs/swagger`:
   - `@ApiTags()` - Nhóm endpoint
   - `@ApiOperation()` - Mô tả operation
   - `@ApiParam()` - Mô tả parameters
   - `@ApiBody()` - Mô tả request body
   - `@ApiResponse()` - Mô tả response

2. Tạo DTOs với `@ApiProperty()` decorator

3. Import và sử dụng trong controller

## Ví dụ

```typescript
@Post()
@ApiOperation({ summary: 'Create a new item' })
@ApiBody({ type: CreateItemDto })
@ApiResponse({
  status: 201,
  description: 'Item created successfully',
  type: ItemResponseDto
})
createItem(@Body() createItemDto: CreateItemDto) {
  // Implementation
}
```

## Troubleshooting

- Nếu Swagger UI không hiển thị, kiểm tra console log
- Đảm bảo ứng dụng đang chạy trên port 3000
- Kiểm tra các import và decorator đã được sử dụng đúng cách
