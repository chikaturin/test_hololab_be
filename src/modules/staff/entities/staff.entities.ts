import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

@Schema({ collection: 'staff', timestamps: true })
export class Staff extends Document {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: Date, required: true })
  dob: Date;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: Number, required: true, default: 0 })
  salary: number;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: String, required: true })
  jobTitle: string;

  @Prop({ type: Date, required: true })
  hireDate: Date;

  @Prop({ type: Boolean, required: true, default: true })
  status: boolean;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
