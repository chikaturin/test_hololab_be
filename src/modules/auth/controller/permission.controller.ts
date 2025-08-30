import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AddPermissionsDto } from '../dto/index.dto';
import { ResponseMessage } from '../../../common/decorators/index.decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { DeletePermissionsDto } from '../dto/delete-permissions.dto';
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly authService: AuthService) {}
  @Post(':id')
  @ApiOperation({ summary: 'Add permissions to a role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions added to role successfully',
  })
  @ApiBody({ type: AddPermissionsDto })
  @ResponseMessage('Permissions added to role successfully')
  addPermissionsToRole(
    @Param('id') id: string,
    @Body() dto: AddPermissionsDto,
  ) {
    return this.authService.addPermissionsToRole(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  @ResponseMessage('Permissions fetched successfully')
  getAllPermissions() {
    return this.authService.getAllPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all permissions of a role' })
  @ApiResponse({ status: 200, description: 'List of role permissions' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ResponseMessage('Role permissions fetched successfully')
  getRolePermissions(@Param('id') id: string) {
    return this.authService.getRoleFromPermissions(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  @ApiNotFoundResponse({ description: 'Role or permission not found' })
  @ApiBody({ type: AddPermissionsDto })
  @ResponseMessage('Permission removed successfully')
  removePermissionFromRole(@Body() dto: DeletePermissionsDto) {
    return this.authService.removePermissionFromRole(dto);
  }
}
