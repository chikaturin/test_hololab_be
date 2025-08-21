import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { Auth, AuthDocument } from './entities/auth.entity';
import { hashPassword } from '../util/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  async register(registerDto: RegisterDto): Promise<Auth> {
    const hashedPassword = await hashPassword(registerDto.password);
    const newAuth = new this.authModel({
      ...registerDto,
      password: hashedPassword,
    });
    return newAuth.save();
  }
}
