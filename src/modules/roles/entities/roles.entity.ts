import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';
import { RoleType } from '../enums/role.enum';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ collection: 'roles', timestamps: true })
export class Role extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(RoleType),
    default: RoleType.EMPLOYEE,
  })
  roleType: RoleType;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'low' })
  level: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Permission', required: false })
  permissions: Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
