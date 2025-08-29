import { Injectable } from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto } from './dto/index.dto';
import { Staff } from './entities/staff.entities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPassword } from 'src/utils/bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createStaff(createStaffDto: CreateStaffDto): Promise<string> {
    const staff = new this.staffModel(createStaffDto);

    const userMail = await this.userModel.findOne({
      email: createStaffDto.email,
    });
    if (userMail) {
      throw new Error('Mail already exists');
    }

    const user = new this.userModel({
      email: createStaffDto.email,
      password: await hashPassword(createStaffDto.password),
      staffId: staff._id,
    });
    await staff.save();
    await user.save();

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
    const staff = await this.staffModel
      .findById(id)
      .populate('departmentId', 'name description');
    if (!staff) {
      throw new Error('Staff not found');
    }
    return staff;
  }

  async getAllStaff(): Promise<Staff[]> {
    return this.staffModel.find().populate('departmentId', 'name');
  }
}
