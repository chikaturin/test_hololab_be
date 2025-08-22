import { Module } from '@nestjs/common';
import { AuthController } from './controller/index';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionSchema } from './entities/permission.entity';
import { User, UserSchema } from 'src/modules/users/entities/user.entity';
import { TokenModule } from '../token/token.module';
import { RoleModule } from 'src/modules/roles/role.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permissions.name, schema: PermissionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TokenModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
