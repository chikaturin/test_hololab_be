import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ collection: 'departments', timestamps: true })
export class Department extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Boolean, required: true, default: true })
  isActive: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
