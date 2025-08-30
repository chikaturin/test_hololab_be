import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role, RoleSchema } from './entities/roles.entity';
import { UserRole, UserRoleSchema } from './entities/user-role.entity';
import {
  RolePermission,
  RolePermissionSchema,
} from '../auth/entities/role-permissions.entity';
import {
  Permissions,
  PermissionSchema,
} from '../auth/entities/permission.entity';
import { TokenModule } from '../token/token.module';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: UserRole.name, schema: UserRoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Permissions.name, schema: PermissionSchema },
    ]),
    TokenModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, AuthGuard, PermissionsGuard],
  exports: [RoleService],
})
export class RoleModule {}
