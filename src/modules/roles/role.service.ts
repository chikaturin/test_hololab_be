import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, UserRoleDocument } from './entities/user-role.entity';
import { Role, RoleDocument } from './entities/roles.entity';
import {
  RolePermission,
  RolePermissionDocument,
} from '../auth/entities/role-permissions.entity';
import { AssignRoleDto, UpdateRoleDto } from './dto';
@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
    @InjectModel(UserRole.name)
    private readonly userRoleModel: Model<UserRoleDocument>,
  ) {}

  async findRoleByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name });
  }
  async createRole(name: string, description?: string): Promise<Role> {
    const existingRole = await this.findRoleByName(name);
    if (existingRole) {
      throw new ConflictException('Role already exists');
    }
    const role = new this.roleModel({ name, description });
    return role.save();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleModel.find();
  }

  async getRoleById(id: string): Promise<any> {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    const rolePermissions = await this.rolePermissionModel
      .find({ roleId: id, isActive: true })
      .select('permissionId isActive');
    const roleObj = role.toObject();
    return { ...roleObj, rolePermissions };
  }
  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const updated = await this.roleModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name: updateRoleDto.name,
          description: updateRoleDto.description,
        },
      },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Role not found');
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleModel.findByIdAndDelete(id);
    await this.rolePermissionModel.deleteMany({ roleId: id });
    await this.userRoleModel.deleteMany({ roleId: id });
  }

  async assignRoleToUser(dto: AssignRoleDto): Promise<UserRole> {
    const { userId, roleId } = dto;
    const userRole = await this.userRoleModel.create({ userId, roleId });
    return userRole;
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await this.rolePermissionModel
      .find({ roleId, isActive: true })
      .populate('permissionId', 'name')
      .select('permissionId');

    return rolePermissions
      .map((rp) => (rp.permissionId as any)?.name || '')
      .filter(Boolean);
  }

  async findUserWithRoles(userId: string): Promise<any> {
    const User = this.roleModel.db.collection('users');
    const user = await User.findOne({
      _id: new (this.roleModel.db.constructor as any).ObjectId(userId),
    });
    if (!user) return null;

    const userRoles = await this.userRoleModel.find({ userId });

    return {
      ...user,
      userRoles,
    };
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleModel.find({ userId });
    const roleIds = userRoles.map((ur) => ur.roleId);
    if (roleIds.length === 0) return [] as unknown as Role[];
    return this.roleModel.find({ _id: { $in: roleIds } });
  }
}
