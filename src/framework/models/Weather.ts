import { weather } from '@prisma/client';
import { APIEmbed } from 'discord-api-types/v10';
import { findBestMatch } from 'string-similarity';
import { KauriClient } from '../client/KauriClient';

export class Weather {
	public dbid: number;
	public name: string;
	public description: string;
	public color: number;
	public emoji: string;
	public code: string;

	private static list: string[];
	private static listLastFetched: number;

	public constructor(data: weather) {
		this.dbid = data.dbid;
		this.name = data.name;
		this.description = data.description;
		this.color = data.color;
		this.emoji = data.emoji;
		this.code = data.code;
	}

	private static async getList(client: KauriClient) {
		const list = await client.database.weather.findMany({ select: { name: true } });
		this.list = list.map(x => x.name);
		this.listLastFetched = Date.now();
	}

	public static async fetch(client: KauriClient, value: string): Promise<Weather | null> {
		if (this.listLastFetched < Date.now() - (1000 * 60 * 60)) {
			await this.getList(client);
		}

		const { bestMatch } = findBestMatch(value, this.list);
		const data = await client.database.weather.findFirst({ where: { name: bestMatch.target } });

		return data ? new this(data) : null;
	}

	public info(client: KauriClient): APIEmbed {
		return {
			title: `${client.emojis.cache.get(this.emoji)?.toString() ?? this.emoji} ${this.name}`,
			description: this.description,
			color: this.color
		};
	}
}
