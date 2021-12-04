import type { ObjectId } from "mongodb";
import type { KauriClient } from "../KauriClient";

interface LogChannelSchema {
	_id: ObjectId;
	guild_id: string;
	channel_id: string;
}

export class LogChannel {
	public guild_id: string;
	public channel_id: string;

	constructor(data: LogChannelSchema) {
		this.guild_id = data.guild_id;
		this.channel_id = data.channel_id;
	}

	public static async fetch(client: KauriClient, value: string): Promise<LogChannel | null> {
		const db = await client.getDatabase();
		const data = await db.collection<LogChannelSchema>("roleConfig").findOne({ guild_id: value });
		return data ? new this(data) : null;
	}
}
