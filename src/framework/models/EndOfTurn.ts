import { end_of_turn } from '@prisma/client';
import { findBestMatch } from 'string-similarity';
import { KauriClient } from '../client/KauriClient';

export class EndOfTurn {
	public dbid: number;
	public order: number;
	public effect: string;

	private static list: string[];
	private static listLastFetched: number;

	public constructor(data: end_of_turn) {
		this.dbid = data.dbid;
		this.order = data.order;
		this.effect = data.effect;
	}

	private static async getList(client: KauriClient) {
		const list = await client.database.end_of_turn.findMany({ select: { effect: true } });
		this.list = list.map(x => x.effect);
		this.listLastFetched = Date.now();
	}

	public static async fetch(client: KauriClient, value: string): Promise<EndOfTurn | null> {
		if (this.listLastFetched < Date.now() - (1000 * 60 * 60)) {
			await this.getList(client);
		}

		const { bestMatch } = findBestMatch(value, this.list);
		const data = await client.database.end_of_turn.findFirst({ where: { effect: bestMatch.target } });

		return data ? new this(data) : null;
	}

	public async getSurrounding(client: KauriClient): Promise<EndOfTurn[]> {
		const data = await client.database.end_of_turn.findMany({
			where: {
				order: {
					gt: Math.floor(this.order) - 3,
					lt: Math.floor(this.order) + 3
				}
			}
		});

		return data.map(d => new EndOfTurn(d));
	}
}
