import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/index.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
  ) {}

  async getAllDepartments(): Promise<Department[]> {
    return this.departmentModel.find();
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
