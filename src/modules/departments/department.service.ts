import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/index.dto';
import { Staff } from 'src/modules/staff/entities/staff.entities';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/modules/roles/entities/user-role.entity';
import { RoleService } from '../roles/role.service';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<Staff>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(UserRole.name)
    private readonly userRoleModel: Model<UserRole>,
    private readonly roleService: RoleService,
  ) {}

  async getAllDepartments(): Promise<any[]> {
    const departments = await this.departmentModel.find();
    const counts = await this.staffModel.aggregate([
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map<string, number>(
      counts.map((c: any) => [String(c._id), c.count]),
    );

    const results = await Promise.all(
      departments.map(async (d) => {
        let manager: string | null = null;

        const managerStaff = await this.staffModel
          .findOne({ departmentId: d._id as any, jobTitle: /manager/i })
          .select('firstName lastName');

        if (managerStaff) {
          manager = `${managerStaff.firstName} ${managerStaff.lastName}`;
        } else {
          const managerUserRoles = await this.userRoleModel
            .find({ isActive: true })
            .populate('roleId');

          const managerRoles = managerUserRoles.filter(
            (ur: any) => ur.roleId && ur.roleId.roleType === 'manager',
          );

          for (const userRole of managerRoles) {
            const user = await this.userModel.findById(userRole.userId);

            if (user && user.staffId) {
              const staff = await this.staffModel.findById(user.staffId);

              if (staff && staff.departmentId) {
                if (
                  staff.departmentId.toString() === (d._id as any).toString()
                ) {
                  manager = `${staff.firstName} ${staff.lastName}`;
                  break;
                }
              }
            }
          }
        }

        return {
          ...d.toObject(),
          manager: manager,
          staffCount: countsMap.get(String(d._id)) ?? 0,
        };
      }),
    );
    return results;
  }

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    const existingDepartment = await this.departmentModel.findOne({
      name: createDepartmentDto.name,
    });
    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }
    const newDepartment = new this.departmentModel(createDepartmentDto);
    const savedDepartment = await newDepartment.save();

    if (createDepartmentDto.userManager) {
      await this.roleService.assignRoleToUser({
        userManager: createDepartmentDto.userManager,
      });
    }

    return savedDepartment;
  }

  async updateDepartment(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const existingDepartment = await this.departmentModel.findByIdAndUpdate(
      id,
      updateDepartmentDto,
      { new: true },
    );
    if (!existingDepartment) {
      throw new NotFoundException('Department not found');
    }

    if (updateDepartmentDto.userManager) {
      await this.roleService.assignRoleToUser({
        userManager: updateDepartmentDto.userManager,
      });
    }

    return existingDepartment;
  }

  async deleteDepartment(id: string): Promise<void> {
    const existingDepartment = await this.departmentModel.findByIdAndDelete(id);
    if (!existingDepartment) {
      throw new NotFoundException('Department not found');
    }
  }
}
