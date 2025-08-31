import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../../utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password');
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateStatus(id: string, status: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByDepartment(departmentId: string): Promise<User[]> {
    return this.userModel.find({ departmentId }).select('-password');
  }

  async findOneByIdWithRoles(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const UserRole = this.userModel.db.collection('user_roles');
    const Role = this.userModel.db.collection('roles');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ObjectId } = require('mongodb');
    const userObjectId = new ObjectId(userId);

    console.log('=== findOneByIdWithRoles Debug ===');
    console.log('userId:', userId);
    console.log('userObjectId:', userObjectId);

    const userRoles = await UserRole.find({
      userId: userObjectId,
      isActive: true,
    }).toArray();

    console.log('userRoles found (isActive: true):', userRoles);

    // Populate role information for each userRole (same format as auth endpoint)
    const populatedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const role = await Role.findOne({ _id: new ObjectId(userRole.roleId) });
        console.log('Role found for userRole:', userRole._id, ':', role);
        return {
          role: {
            name: role?.name,
            _idRole: role?._id?.toString() || userRole.roleId?.toString(),
          },
        };
      }),
    );

    console.log('Final populatedUserRoles:', populatedUserRoles);

    return {
      ...user.toObject(),
      userRoles: populatedUserRoles,
    };
  }
}
