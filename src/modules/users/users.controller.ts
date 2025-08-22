import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ResponseMessage } from 'src/common/decorators/index.decorators';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permissions as PermissionEnum } from 'src/modules/auth/enums/permissions.enum';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiBearerAuth()
  @ResponseMessage('User created successfully')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions(PermissionEnum.VIEW_ALL_DATA)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiBearerAuth()
  @ResponseMessage('Users fetched successfully')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionEnum.VIEW_ALL_DATA)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiBearerAuth()
  @ResponseMessage('User fetched successfully')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBearerAuth()
  @ResponseMessage('User updated successfully')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiBearerAuth()
  @ResponseMessage('User deleted successfully')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/status')
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiBearerAuth()
  @ResponseMessage('User status updated successfully')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.updateStatus(id, status);
  }

  @Get('department/:departmentId')
  @Permissions(PermissionEnum.VIEW_ALL_DATA)
  @ApiOperation({ summary: 'Get users by department' })
  @ApiResponse({ status: 200, description: 'Users found by department' })
  @ApiBearerAuth()
  @ResponseMessage('Users fetched by department successfully')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.usersService.findByDepartment(departmentId);
  }
}
