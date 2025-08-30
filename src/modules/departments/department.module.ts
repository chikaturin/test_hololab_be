import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './entities/department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { Staff, StaffSchema } from '../staff/entities/staff.entities';
import { UserRole, UserRoleSchema } from '../roles/entities/user-role.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { RoleModule } from '../roles/role.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: UserRole.name, schema: UserRoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    RoleModule,
    TokenModule,
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
