import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CreateRoleDto, AssignRoleDto, UpdateRoleDto } from './dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiTags,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permissions as PermissionEnum } from 'src/modules/auth/enums/permissions.enum';
@ApiTags('Roles')
@Controller('/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.ROLE_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  @ResponseMessage('Roles fetched successfully')
  getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.ROLE_MANAGEMENT)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiBody({ type: CreateRoleDto })
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ResponseMessage('Role created successfully')
  createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body.name, body.description);
  }

  @Get(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.ROLE_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ResponseMessage('Role fetched successfully')
  getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.ROLE_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ResponseMessage('Role updated successfully')
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.roleService.updateRole(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.ROLE_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ResponseMessage('Role deleted successfully')
  deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Post('assign')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.ROLE_MANAGEMENT)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ResponseMessage('Role assigned successfully')
  assignRoleToUser(@Body() body: AssignRoleDto) {
    return this.roleService.assignRoleToUser(body);
  }
}
