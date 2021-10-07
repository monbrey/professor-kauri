import type { KauriClient } from "../KauriClient";
import { Database } from "../util/Database";

export interface EotSchema {
	_id: number;
	order: number;
	effect: string;
}

export class EOT {
	public order: number;
	public effect: string;

	constructor(data: EotSchema) {
		this.order = data.order;
		this.effect = data.effect;
	}

	public static async fetch(client: KauriClient, value: string): Promise<EOT | null> {
		const data = await Database.findClosest("eot", "effect", value);
		return data ? new this(data) : null;
	}

	public async getSurrounding(client: KauriClient): Promise<EOT[]> {
		const database = await client.getDatabase();
		const data = await database.collection<EotSchema>("eot").find({
			order: {
				$gt: Math.floor(this.order) - 3,
				$lt: Math.floor(this.order) + 3,
			},
		}).toArray();

		return data.map(d => new EOT(d));
	}
}
