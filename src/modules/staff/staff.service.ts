import { Injectable } from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto } from './dto/index.dto';
import { Staff } from './entities/staff.entities';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { hashPassword } from 'src/utils/bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { RoleService } from '../roles/role.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    private readonly roleService: RoleService,
  ) {}

  async createStaff(createStaffDto: CreateStaffDto): Promise<string> {
    const staff = new this.staffModel(createStaffDto);

    const userMail = await this.userModel.findOne({
      email: createStaffDto.email,
    });
    if (userMail) {
      return 'Mail already exists';
    }

    const staffRole = await this.roleService.findRoleByName('Staff');
    if (!staffRole) {
      return 'Staff role not found';
    }

    const user = new this.userModel({
      email: createStaffDto.email,
      password: await hashPassword(createStaffDto.password),
      staffId: staff._id,
    });

    await staff.save();
    await user.save();

    await this.userRoleModel.create({
      userId: user._id,
      roleId: staffRole._id,
      isActive: true,
    });

    return 'Staff create Successfully';
  }

  async updateStaff(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    const updatedStaff = await this.staffModel.findByIdAndUpdate(
      id,
      updateStaffDto,
      { new: true },
    );
    if (!updatedStaff) {
      throw new Error('Staff not found');
    }
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<void> {
    const staff = await this.staffModel.findById(id);
    if (!staff) {
      throw new Error('Staff not found');
    }

    await this.userModel.deleteMany({ staffId: staff._id });

    await this.staffModel.findByIdAndDelete(id);
  }

  async getStaffById(id: string): Promise<Staff> {
    const staff = await this.staffModel.findById(id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    if (isValidObjectId(staff.departmentId)) {
      await staff.populate('departmentId', 'name description');
    }
    const user = await this.userModel
      .findOne({ staffId: staff._id })
      .select('email');
    const result: any = staff.toObject();
    result.email = user?.email ?? result.email;
    return result;
  }

  async getAllStaff(): Promise<Staff[]> {
    const staffs = await this.staffModel.find();
    const validRefs = staffs.filter((s) => isValidObjectId(s.departmentId));
    if (validRefs.length > 0) {
      await this.staffModel.populate(validRefs, {
        path: 'departmentId',
        select: 'name',
      });
    }
    const staffIds = staffs.map((s) => s._id);
    const users = await this.userModel
      .find({ staffId: { $in: staffIds as any } })
      .select('email staffId _id');
    const staffIdToEmail = new Map<string, string>();
    const staffIdToUserId = new Map<string, string>();

    users.forEach((u: any) => {
      if (u.staffId) {
        staffIdToEmail.set(String(u.staffId), u.email);
        staffIdToUserId.set(String(u.staffId), u._id.toString());
      }
    });

    return staffs.map((s) => {
      const obj: any = s.toObject();
      obj.email = staffIdToEmail.get(String(s._id)) ?? obj.email;
      obj.userId = staffIdToUserId.get(String(s._id));
      return obj;
    });
  }
}
