import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';

export type RolePermissionDocument = HydratedDocument<RolePermission>;

@Schema({ collection: 'role_permissions', timestamps: true })
export class RolePermission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Permissions', required: true })
  permissionId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);
