import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum SystemRole {
  Admin = 'admin',
  Manager = 'manager',
  Staff = 'staff',
}

@Schema({ collection: 'auth', timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(SystemRole),
    default: SystemRole.Staff,
  })
  role: SystemRole;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: false })
  employeeId?: Types.ObjectId;

  // createdAt and updatedAt are handled by timestamps option
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const AuthSchema = SchemaFactory.createForClass(User);
