import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';
import { SystemRole } from '../enums/auth.enum';

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ collection: 'auth', timestamps: true })
export class Auth extends Document {
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

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: false })
  employeeId?: Types.ObjectId;

  // createdAt and updatedAt are handled by timestamps option
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
