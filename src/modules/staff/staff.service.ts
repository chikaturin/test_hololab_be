import { Injectable } from '@nestjs/common';
import { CreateStaffDto, UpdateStaffDto } from './dto/index.dto';
import { Staff } from './entities/staff.entities';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StaffService {
  constructor(@InjectModel(Staff.name) private staffModel: Model<Staff>) {}

  async createStaff(createStaffDto: CreateStaffDto): Promise<Staff> {
    const staff = new this.staffModel(createStaffDto);
    return staff.save();
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
    const deletedStaff = await this.staffModel.findByIdAndDelete(id);
    if (!deletedStaff) {
      throw new Error('Staff not found');
    }
  }

  async getStaffById(id: string): Promise<Staff> {
    const staff = await this.staffModel.findById(id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    return staff;
  }

  async getAllStaff(): Promise<Staff[]> {
    return this.staffModel.find();
  }
}
