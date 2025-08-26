import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  BadRequestException,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entities';
import { CreateStaffDto, UpdateStaffDto } from './dto/index.dto';
import { Permissions as PermissionEnum } from 'src/modules/auth/enums/permissions.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all staff' })
  @ApiResponse({
    status: 200,
    description: 'Return all staff',
    type: [Staff],
  })
  async getAllStaff(): Promise<Staff[]> {
    try {
      return this.staffService.getAllStaff();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff' })
  @ApiResponse({
    status: 201,
    description: 'Staff and user created successfully',
    schema: {
      type: 'object',
      properties: {
        staff: { $ref: '#/components/schemas/Staff' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  async createStaff(
    @Body(new ValidationPipe({ transform: true }))
    createStaffDto: CreateStaffDto,
  ): Promise<{ staff: Staff; user: User }> {
    try {
      return this.staffService.createStaff(createStaffDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a staff' })
  @ApiResponse({
    status: 200,
    description: 'Staff updated successfully',
    type: Staff,
  })
  async updateStaff(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    try {
      return this.staffService.updateStaff(id, updateStaffDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a staff' })
  @ApiResponse({
    status: 200,
    description: 'Staff deleted successfully',
    type: Staff,
  })
  async deleteStaff(@Param('id') id: string): Promise<void> {
    try {
      return this.staffService.deleteStaff(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(PermissionEnum.USER_MANAGEMENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a staff by id' })
  @ApiResponse({
    status: 200,
    description: 'Return a staff by id',
    type: Staff,
  })
  async getStaffById(@Param('id') id: string): Promise<Staff> {
    try {
      return this.staffService.getStaffById(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
