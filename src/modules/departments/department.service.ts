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

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<Staff>,
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
        const manager = await this.staffModel
          .findOne({ departmentId: d._id as any, jobTitle: /manager/i })
          .select('firstName lastName');

        return {
          ...d.toObject(),
          manager: manager ? `${manager.firstName} ${manager.lastName}` : null,
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
    return newDepartment.save();
  }

  async updateDepartment(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const existingDepartment = await this.departmentModel.findByIdAndUpdate(
      id,
      updateDepartmentDto,
    );
    if (!existingDepartment) {
      throw new NotFoundException('Department not found');
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
