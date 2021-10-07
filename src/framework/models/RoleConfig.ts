import type { ObjectId } from "mongodb";
import type { KauriClient } from "../KauriClient";

interface RoleConfigSchema {
	_id: ObjectId;
	role_id: string;
	name: string;
	children?: string[];
	parents?: string[];
	self?: boolean;
}

export class RoleConfig {
	public role_id: string;
	public name: string;
	public children?: string[];
	public parents?: string[];
	public self?: boolean;

	constructor(data: RoleConfigSchema) {
		this.role_id = data.role_id;
		this.name = data.name;
		this.children = data.children;
		this.parents = data.parents;
		this.self = data.self;
	}

	public static async fetch(client: KauriClient, value: string): Promise<RoleConfig | null> {
		const db = await client.getDatabase();
		const data = await db.collection<RoleConfigSchema>("roleConfig").findOne({ role_id: value });
		return data ? new this(data) : null;
	}
}
