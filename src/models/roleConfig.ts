import { Document, Model, Schema } from "mongoose";
import { instanceDB } from "../util/db";

export interface IRoleConfigDocument extends Document {
    role_id: string;
    name: string;
    children?: string[];
    parents?: string[];
    self?: boolean;
}

export interface IRoleConfig extends IRoleConfigDocument { }

export interface IRoleConfigModel extends Model<IRoleConfig> { }

const RoleConfigSchema: Schema = new Schema({
    role_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    children: [String],
    parents: [String],
    self: Boolean
}, { collection: "roles" });

export const RoleConfig: IRoleConfigModel = instanceDB.model<IRoleConfig, IRoleConfigModel>("RoleConfig", RoleConfigSchema);
