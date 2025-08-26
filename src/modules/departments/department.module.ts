import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department, DepartmentSchema } from './entities/department.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { RoleModule } from 'src/modules/roles/role.module';
import { TokenModule } from 'src/modules/token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
    ]),
    RoleModule,
    TokenModule,
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService, AuthGuard, PermissionsGuard],
})
export class DepartmentModule {}
