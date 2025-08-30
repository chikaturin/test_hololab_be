import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController, PermissionsController } from './controller';
import { TokenModule } from '../token/token.module';
import { RoleModule } from '../../modules/roles/role.module';
import { Permissions, PermissionSchema } from './entities/permission.entity';
import { User, UserSchema } from '../../modules/users/entities/user.entity';
import {
  RolePermission,
  RolePermissionSchema,
} from './entities/role-permissions.entity';
import { Role, RoleSchema } from '../../modules/roles/entities/roles.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permissions.name, schema: PermissionSchema },
      { name: User.name, schema: UserSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    TokenModule,
    RoleModule,
  ],
  controllers: [AuthController, PermissionsController],
  providers: [AuthService],
  exports: [AuthService, TokenModule],
})
export class AuthModule {}
