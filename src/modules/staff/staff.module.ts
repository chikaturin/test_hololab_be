import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from './entities/staff.entities';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { UsersModule } from '../users';
import { User, UserSchema } from '../users/entities/user.entity';
import { UserRole, UserRoleSchema } from '../roles/entities/user-role.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { RoleModule } from 'src/modules/roles/role.module';
import { TokenModule } from 'src/modules/token/token.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
      { name: User.name, schema: UserSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
    RoleModule,
    TokenModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, AuthGuard, PermissionsGuard],
})
export class StaffModule {}
