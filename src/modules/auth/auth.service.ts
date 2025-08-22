import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Permissions, PermissionDocument } from './entities/index.entities';
import { hashPassword, comparePassword } from 'src/utils/bcrypt';
import { TokenService } from '../token/token.service';
import { AddPermissionsDto } from './dto/add-permissions.dto';
import { Role, RoleDocument } from 'src/modules/roles/entities/roles.entity';
import { DeletePermissionsDto } from './dto/delete-permissions.dto';
import { RoleService } from 'src/modules/roles/role.service';
import {
  RolePermission,
  RolePermissionDocument,
} from 'src/modules/auth/entities/role-permissions.entity';
import { User, UserDocument } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
    @InjectModel(Permissions.name)
    private readonly permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await hashPassword(registerDto.password);
    const newUser = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Email is not exist');
    }

    const isValid = await comparePassword(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const { accessToken, refreshToken, sessionId } =
      await this.tokenService.generateTokenPair(
        { userId: user.id, email: user.email },
        ipAddress,
        userAgent,
      );

    return { accessToken, refreshToken, sessionId };
  }

  async refreshToken(
    refreshToken: string,
    sessionId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const payload = await this.tokenService.verifyToken(
      refreshToken,
      sessionId,
      true,
    );
    const user = await this.userModel.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    await this.tokenService.revokeSession(payload.userId, sessionId);
    const tokenPair = await this.tokenService.generateTokenPair(
      {
        userId: user.id,
        email: user.email,
      },
      userAgent,
      ipAddress,
    );

    return { ...tokenPair, sessionId: tokenPair.sessionId };
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await this.tokenService.removeTokenFromRedis(userId, sessionId);
  }

  async createPermission(module: string, name: string): Promise<Permissions> {
    const permission = await this.permissionModel.create({ module, name });
    return permission;
  }

  async findPermission(
    module: string,
    name: string,
  ): Promise<Permissions | null> {
    return this.permissionModel.findOne({
      where: { module: module, name: name },
    });
  }
  async findPermissionById(id: string): Promise<Permissions | null> {
    return this.permissionModel.findOne({
      where: { id: id },
    });
  }

  async addPermissionsToRole(
    roleId: string,
    dto: AddPermissionsDto,
  ): Promise<void> {
    const role = await this.roleService.getRoleById(roleId);
    if (!role) throw new NotFoundException('Role not found');

    const permission = await this.findPermission(dto.module, dto.name);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const exists = await this.rolePermissionModel.findOne({
      roleId: roleId,
      permissionId: permission._id,
    });

    if (exists) {
      throw new ConflictException('Permission already assigned to this role');
    }

    await this.rolePermissionModel.create({
      roleId: roleId,
      permissionId: permission._id,
    });
  }

  async getRoleFromPermissions(roleId: string): Promise<string[]> {
    const role = await this.roleService.getRoleById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const permissionKeys = role.rolePermissions.map((rp) => rp.permission.name);
    return permissionKeys;
  }

  async removePermissionFromRole(
    deletePermissionsDto: DeletePermissionsDto,
  ): Promise<void> {
    await this.rolePermissionModel.deleteOne({
      roleId: deletePermissionsDto.roleId,
      permissionId: deletePermissionsDto.permissionId,
    });
  }

  async findOneByIdWithRoles(id: string): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    const userRoles = await this.roleService.getUserRoles(id);

    return {
      ...user.toObject(),
      userRoles: userRoles,
    };
  }

  async getAllPermissions(): Promise<Permissions[]> {
    return this.permissionModel.find();
  }
}
