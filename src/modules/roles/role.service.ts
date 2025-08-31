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
        .find({ roleId: new Types.ObjectId(id), isActive: true })
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
      _id: (role._id as any).toString(),
      usersCount,
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

    if (updateData.permissions) {
      await this.updateRolePermissions(
        id,
        updateData.permissions.map((p: any) => p.toString()),
      );
    }

    return role as Role;
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleModel.findByIdAndDelete(id);
    await this.rolePermissionModel.deleteMany({ roleId: id });
    await this.userRoleModel.deleteMany({ roleId: id });
  }

  async assignRoleToUser(dto: AssignRoleDto): Promise<UserRole> {
    const { userManager } = dto;
    if (!userManager) {
      throw new NotFoundException('User ID is required');
    }

    console.log('=== assignRoleToUser Debug ===');
    console.log('userManager:', userManager);

    const findRoleManagement = await this.roleModel.findOne({
      roleType: 'manager',
    });

    console.log('=== Role Search Debug ===');
    console.log('Searching for roleType: manager');
    console.log('Manager role found:', findRoleManagement);

    if (!findRoleManagement) {
      throw new NotFoundException('Role not found');
    }

    console.log('Manager role ID:', findRoleManagement._id);

    const existingUserRoles = await this.userRoleModel
      .find({
        userId: userManager,
      })
      .lean();

    console.log('=== Force Query Debug ===');
    console.log('Query filter:', { userId: userManager });
    console.log('Raw query result:', existingUserRoles);

    console.log('All existing user roles found:', existingUserRoles.length);
    console.log(
      'All existing role IDs:',
      existingUserRoles.map((ur) => ur._id),
    );
    console.log(
      'All existing role details:',
      existingUserRoles.map((ur) => ({
        _id: ur._id,
        roleId: ur.roleId,
        isActive: ur.isActive,
        createdAt: ur.createdAt,
      })),
    );

    if (existingUserRoles.length > 0) {
      const roleIds = existingUserRoles.map((ur) => ur._id);
      console.log('Deactivating ALL role IDs:', roleIds);

      const updateResult = await this.userRoleModel.updateMany(
        { _id: { $in: roleIds } },
        { isActive: false, updatedAt: new Date() },
      );

      console.log('Update result:', updateResult);
    }

    console.log('=== Checking for existing Manager role ===');
    const existingManagerRole = await this.userRoleModel.findOne({
      userId: userManager,
      roleId: findRoleManagement._id,
    });

    console.log('Existing Manager role found:', existingManagerRole);

    if (existingManagerRole) {
      console.log('Reactivating existing Manager role...');
      await this.userRoleModel.findByIdAndUpdate(existingManagerRole._id, {
        isActive: true,
        updatedAt: new Date(),
      });
      console.log('Manager role reactivated successfully');
      return existingManagerRole;
    }

    console.log('=== Creating new Manager role ===');
    const userRole = await this.userRoleModel.create({
      userId: userManager,
      roleId: findRoleManagement._id,
      isActive: true,
    });

    console.log('New Manager role created:', userRole);
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

    // Convert userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);

    console.log('=== findUserWithRoles Debug ===');
    console.log('userId:', userId);
    console.log('userObjectId:', userObjectId);

    const userRoles = await this.userRoleModel
      .find({ userId: userObjectId, isActive: true })
      .lean();

    console.log('userRoles found (isActive: true):', userRoles);

    const populatedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const role = await this.roleModel.findById(userRole.roleId).lean();
        console.log('Role found for userRole:', userRole._id, ':', role);
        return {
          ...userRole,
          role: role
            ? {
                ...role,
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                _id: role._id.toString(),
              }
            : {},
        };
      }),
    );

    console.log('Final populatedUserRoles:', populatedUserRoles);

    return {
      ...user,
      userRoles: populatedUserRoles,
    };
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleModel.find({ userId });
    const roleIds = userRoles.map((ur) => ur.roleId);
    if (roleIds.length === 0) return [] as unknown as Role[];

    const roles = await this.roleModel.find({ _id: { $in: roleIds } });

    return roles.map((role: any) => ({
      ...role.toObject(),
      _id: role._id.toString(),
    })) as unknown as Role[];
  }

  private async updateRolePermissions(
    roleId: string,
    newPermissionIds: string[],
  ): Promise<void> {
    await this.roleModel.findByIdAndUpdate(
      roleId,
      { permissions: newPermissionIds.map((id) => new Types.ObjectId(id)) },
      { new: true },
    );

    await this.rolePermissionModel.updateMany(
      { roleId: new Types.ObjectId(roleId) },
      { isActive: false },
    );

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

  async isUserManager(userId: string): Promise<boolean> {
    const userRoles = await this.userRoleModel.find({
      userId: new Types.ObjectId(userId),
    });
    if (userRoles.length === 0) return false;

    const roleIds = userRoles.map((ur) => ur.roleId);

    const roles = await this.roleModel.find({
      _id: { $in: roleIds },
      roleType: 'manager',
    });

    return roles.length > 0;
  }

  async deactivateUserManagerRole(userId: string): Promise<void> {
    // Find and deactivate manager role for user
    const managerRole = await this.roleModel.findOne({ name: 'Manager' });
    if (!managerRole) return;

    await this.userRoleModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        roleId: managerRole._id,
        isActive: true,
      },
      {
        isActive: false,
        updatedAt: new Date(),
      },
    );
  }
}
