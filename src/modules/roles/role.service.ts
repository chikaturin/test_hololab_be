import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async getAllRoles(): Promise<any[]> {
    const roles = await this.roleModel.find();

    const results = await Promise.all(
      roles.map(async (role) => {
        const [usersCount, rolePerms] = await Promise.all([
          this.userRoleModel.countDocuments({
            $or: [
              { roleId: role._id as any },
              { roleId: (role._id as any).toString() },
            ],
            isActive: true,
          }),
          this.rolePermissionModel
            .find({ roleId: role._id, isActive: true })
            .populate('permissionId', 'name module')
            .lean(),
        ]);

        let entityPermissions: string[] = [];
        if (Array.isArray(role.permissions) && role.permissions.length > 0) {
          const permissionIds = role.permissions.map((p: any) => p.toString());
          const populatedPerms = await this.roleModel.db
            .collection('permissions')
            .find({
              _id: { $in: permissionIds.map((id) => new Types.ObjectId(id)) },
            })
            .project({ name: 1, module: 1 })
            .toArray();
          entityPermissions = populatedPerms
            .map((p: any) =>
              p.name && p.module ? `${p.name}.${p.module}` : p.name,
            )
            .filter(Boolean);
        } else if (role.permissions && typeof role.permissions === 'object') {
          const perm = role.permissions as any;
          if (perm.name && perm.module) {
            entityPermissions = [`${perm.name}.${perm.module}`];
          } else if (perm.name) {
            entityPermissions = [perm.name];
          }
        }

        const tablePermissions = rolePerms
          .map((rp: any) =>
            rp.permissionId?.name && rp.permissionId?.module
              ? `${rp.permissionId.name}.${rp.permissionId.module}`
              : rp.permissionId?.name,
          )
          .filter(Boolean);

        const allPermissions = Array.from(
          new Set([...entityPermissions, ...tablePermissions]),
        );

        return {
          ...role.toObject(),
          usersCount,
          permissionsCount: allPermissions.length,
          keyPermissions: allPermissions,
        };
      }),
    );
    return results;
  }

  async getRoleById(id: string): Promise<any> {
    const [role, rolePerms] = await Promise.all([
      this.roleModel.findById(id),
      this.rolePermissionModel
        .find({ roleId: id, isActive: true })
        .populate('permissionId', 'name module')
        .lean(),
    ]);

    if (!role) throw new NotFoundException('Role not found');

    const usersCount = await this.userRoleModel.countDocuments({
      $or: [
        { roleId: role._id as any },
        { roleId: (role._id as any).toString() },
      ],
      isActive: true,
    });

    let entityPermissions: string[] = [];
    if (Array.isArray(role.permissions) && role.permissions.length > 0) {
      const permissionIds = role.permissions.map((p: any) => p.toString());
      const populatedPerms = await this.roleModel.db
        .collection('permissions')
        .find({
          _id: { $in: permissionIds.map((id) => new Types.ObjectId(id)) },
        })
        .project({ name: 1, module: 1 })
        .toArray();
      entityPermissions = populatedPerms
        .map((p: any) =>
          p.name && p.module ? `${p.name}.${p.module}` : p.name,
        )
        .filter(Boolean);
    } else if (role.permissions && typeof role.permissions === 'object') {
      const perm = role.permissions as any;
      if (perm.name && perm.module) {
        entityPermissions = [`${perm.name}.${perm.module}`];
      } else if (perm.name) {
        entityPermissions = [perm.name];
      }
    }

    const tablePermissions = rolePerms
      .map((rp: any) =>
        rp.permissionId?.name && rp.permissionId?.module
          ? `${rp.permissionId.name}.${rp.permissionId.module}`
          : rp.permissionId?.name,
      )
      .filter(Boolean);

    const allPermissions = Array.from(
      new Set([...entityPermissions, ...tablePermissions]),
    );

    return {
      ...role.toObject(),
      usersCount, // Sử dụng usersCount thực tế thay vì hardcode 0
      permissionsCount: allPermissions.length,
      keyPermissions: allPermissions,
    };
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const updateData: any = { ...updateRoleDto };
    if (updateRoleDto.permissionsId) {
      updateData.permissions = updateRoleDto.permissionsId.map(
        (id) => new Types.ObjectId(id),
      );
      delete updateData.permissionsId;
    }

    const role = await this.roleModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!role) throw new NotFoundException('Role not found');

    // Đồng bộ với bảng RolePermission nếu có permissions
    if (updateData.permissions) {
      await this.updateRolePermissions(
        id,
        updateData.permissions.map((p: any) => p.toString()),
      );
    }

    return role;
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
    const role = await this.roleModel
      .findById(roleId)
      .populate('permissions', 'name');
    if (!role) return [];

    if (Array.isArray(role.permissions)) {
      return role.permissions
        .map((perm: any) => perm?.name || '')
        .filter(Boolean);
    }

    return [];
  }

  async findUserWithRoles(userId: string): Promise<any> {
    const User = this.roleModel.db.collection('users');
    const user = await User.findOne({
      _id: new Types.ObjectId(userId),
    });
    if (!user) return null;

    const userRoles = await this.userRoleModel.find({ userId }).lean();

    const populatedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const role = await this.roleModel.findById(userRole.roleId).lean();
        return {
          ...userRole,
          role: role || {},
        };
      }),
    );

    return {
      ...user,
      userRoles: populatedUserRoles,
    };
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleModel.find({ userId });
    const roleIds = userRoles.map((ur) => ur.roleId);
    if (roleIds.length === 0) return [] as unknown as Role[];
    return this.roleModel.find({ _id: { $in: roleIds } });
  }

  private async updateRolePermissions(
    roleId: string,
    newPermissionIds: string[],
  ): Promise<void> {
    // Cập nhật field permissions trong Role entity
    await this.roleModel.findByIdAndUpdate(
      roleId,
      { permissions: newPermissionIds.map((id) => new Types.ObjectId(id)) },
      { new: true },
    );

    // Xóa tất cả permissions cũ trong bảng RolePermission
    await this.rolePermissionModel.updateMany(
      { roleId: new Types.ObjectId(roleId) },
      { isActive: false },
    );

    // Thêm permissions mới vào bảng RolePermission
    if (newPermissionIds.length > 0) {
      const newRolePermissions = newPermissionIds.map((permissionId) => ({
        roleId: new Types.ObjectId(roleId),
        permissionId: new Types.ObjectId(permissionId),
        isActive: true,
      }));

      await this.rolePermissionModel.insertMany(newRolePermissions);
    }

    await this.cleanupDuplicatePermissions(roleId);
  }

  private async cleanupDuplicatePermissions(roleId: string): Promise<void> {
    const rolePermissions = await this.rolePermissionModel
      .find({ roleId, isActive: true })
      .lean();

    const permissionGroups = new Map();
    rolePermissions.forEach((rp) => {
      const permId = rp.permissionId.toString();
      if (!permissionGroups.has(permId)) {
        permissionGroups.set(permId, []);
      }
      permissionGroups.get(permId).push(rp);
    });

    for (const [, records] of permissionGroups.entries()) {
      if (records.length > 1) {
        const [, ...duplicateRecords] = records;
        const duplicateIds = duplicateRecords.map((r) => r._id);

        await this.rolePermissionModel.updateMany(
          { _id: { $in: duplicateIds } },
          { isActive: false },
        );
      }
    }
  }

  async cleanupAllDuplicatePermissions(): Promise<void> {
    const allRoles = await this.roleModel.find();

    for (const role of allRoles) {
      await this.cleanupDuplicatePermissions(
        (role._id as Types.ObjectId).toString(),
      );
    }
  }
}
