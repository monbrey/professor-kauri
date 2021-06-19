import { Snowflake } from 'discord.js';
import { Document, Model, Schema } from 'mongoose';
import { db } from '../../util/db';

export interface IRoleConfigDocument extends Document {
  role_id: Snowflake;
  name: string;
  children?: Snowflake[];
  parents?: Snowflake[];
  self?: boolean;
}

export interface IRoleConfig extends IRoleConfigDocument {}

export interface IRoleConfigModel extends Model<IRoleConfig> {}

const RoleConfigSchema = new Schema<IRoleConfig, IRoleConfigModel>(
  {
    role_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    children: [String],
    parents: [String],
    self: Boolean,
  },
  { collection: 'roles' },
);

export const RoleConfig: IRoleConfigModel = db.model<IRoleConfig, IRoleConfigModel>('RoleConfig', RoleConfigSchema);
