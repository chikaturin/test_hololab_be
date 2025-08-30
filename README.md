# Test Hololab API

A robust NestJS-based REST API with authentication, role-based access control, and Redis Cloud integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based permissions
- **User Management**: Complete user CRUD operations with role assignment
- **Role-Based Access Control**: Flexible permission system with role hierarchies
- **Session Management**: Redis-based session storage with device tracking
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Helmet security headers, CORS configuration
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis Cloud integration for session and token storage
- **Validation**: Class-validator and class-transformer for DTO validation

## 🏗️ Architecture

### Design Choices

This project follows a **modular architecture** with clear separation of concerns:

1. **Module-based Structure**: Each domain (auth, users, roles, departments, staff) is organized into its own module
2. **Guard-based Security**: Authentication and permission checks are handled by guards at the controller level
3. **Service Layer Pattern**: Business logic is encapsulated in services, controllers only handle HTTP requests
4. **DTO Validation**: Input validation using class-validator decorators
5. **Entity-based Models**: Mongoose schemas with proper TypeScript typing
6. **Redis for Sessions**: Distributed session management using Redis Cloud

### Project Structure

```
src/
├── common/           # Shared utilities, guards, decorators
├── config/           # Configuration files (MongoDB, Redis)
├── database/         # Database connection modules
├── global/           # Global enums and classes
├── interfaces/       # TypeScript interfaces
├── modules/          # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── roles/        # Role & permission management
│   ├── departments/  # Department management
│   └── staff/        # Staff management
├── utils/            # Utility functions
└── main.ts           # Application entry point
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- Redis Cloud account

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd test_hololab
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   # Port
   PORT=9999

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_NAME=your_database_name

   # Redis Cloud
   REDIS_HOST=your-redis-host.redis-cloud.com
   REDIS_PORT=your-redis-port
   REDIS_USERNAME=default
   REDIS_PASSWORD=your-redis-password
   REDIS_DB=0

   # JWT Configuration
   JWT_SECRET_AT=your_access_token_secret
   JWT_EXPIRATION_AT=1d
   JWT_SECRET_RT=your_refresh_token_secret
   JWT_EXPIRATION_RT=15d
   ```

4. **Database Setup**

   Ensure your MongoDB instance is running and accessible. The application will automatically create collections and indexes.

5. **Redis Cloud Setup**
   - Sign up for Redis Cloud at [redis.com](https://redis.com)
   - Create a new database
   - Copy connection details to your `.env` file

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

Once the application is running, you can access:

- **API Base URL**: `http://localhost:9999/api`
- **Swagger Documentation**: `http://localhost:9999/api`

## 🔐 Authentication Flow

1. **Registration**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Token Refresh**: `POST /api/auth/refresh-token`
4. **Logout**: `POST /api/auth/logout`

### Protected Routes

Most routes require authentication. Include the following headers:

- `Authorization: Bearer <access_token>`
- `x-session-id: <session_id>`

## 🏢 Core Modules

### Auth Module

- User authentication and session management
- JWT token generation and validation
- Permission-based access control

### Users Module

- User CRUD operations
- Profile management
- Role assignment

### Roles Module

- Role creation and management
- Permission assignment
- User-role relationships

### Departments Module

- Department hierarchy management
- Staff assignment to departments

### Staff Module

- Staff member management
- Department assignment
- Role-based permissions

## 🔧 Configuration

### MongoDB Configuration

Located in `src/config/mongodb.config.ts`, handles database connection with connection pooling and retry logic.

### Redis Configuration

Located in `src/config/redis.config.ts`, manages Redis Cloud connection for session storage and caching.

### Security Configuration

- Helmet for security headers
- CORS configuration for cross-origin requests
- Rate limiting (configurable)

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Jest-based unit tests for services and controllers
- **E2E Tests**: End-to-end testing for API endpoints
- **Test Coverage**: Coverage reports for code quality

## 📦 Dependencies

### Core Dependencies

- `@nestjs/*`: NestJS framework packages
- `mongoose`: MongoDB ODM
- `@nestjs-modules/ioredis`: Redis integration
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT handling

### Development Dependencies

- `@nestjs/cli`: NestJS CLI tools
- `eslint`: Code linting
- `prettier`: Code formatting
- `jest`: Testing framework

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Verify Redis Cloud credentials in `.env`
   - Check network connectivity
   - Ensure Redis Cloud database is active

2. **MongoDB Connection Failed**
   - Verify MongoDB URI in `.env`
   - Check network connectivity
   - Ensure MongoDB instance is running

3. **JWT Token Issues**
   - Verify JWT secrets in `.env`
   - Check token expiration settings

### Logs

The application provides detailed logging for debugging:

- Redis connection status
- Database connection status
- Authentication attempts
- Permission checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the troubleshooting section

---

**Built with ❤️ using NestJS**
