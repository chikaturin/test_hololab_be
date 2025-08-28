import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/index.dto';
import { Department } from './entities/department.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permissions as PermissionEnum } from 'src/modules/auth/enums/permissions.enum';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.TEAM_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: 200,
    description: 'Departments fetched successfully',
    type: [Department],
  })
  async findAll(): Promise<Department[]> {
    return this.departmentService.getAllDepartments();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.TEAM_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: Department,
  })
  async createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    return this.departmentService.createDepartment(createDepartmentDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.TEAM_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: Department,
  })
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentService.updateDepartment(id, updateDepartmentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.TEAM_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({
    status: 200,
    description: 'Department deleted successfully',
    type: Department,
  })
  async deleteDepartment(@Param('id') id: string): Promise<void> {
    return this.departmentService.deleteDepartment(id);
  }
}
