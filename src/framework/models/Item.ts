import { item } from '@prisma/client';
import { APIEmbed } from 'discord-api-types/v10';
import { findBestMatch } from 'string-similarity';
import { KauriClient } from '../client/KauriClient';

export class Item implements item {
	public dbid: number;
	public name: string;
	public description: string;
	// public category: string[];
	public price: number | null;

	private static list: string[] = [];
	private static listLastFetched = 0;

	public constructor(data: item) {
		this.dbid = data.dbid;
		this.name = data.name;
		this.description = data.description;
		// this.category = data.category;
		this.price = data.price;
	}

	private static async getList(client: KauriClient) {
		const list = await client.database.ability.findMany({ select: { name: true } });
		this.list = list.map(x => x.name);
		this.listLastFetched = Date.now();
	}

	public static async fetch(client: KauriClient, value: string): Promise<Item | null> {
		if (this.listLastFetched < Date.now() - (1000 * 60 * 60)) {
			await this.getList(client);
		}

		const { bestMatch } = findBestMatch(value, this.list);
		const data = await client.database.item.findFirst({ where: { name: bestMatch.target } });

		return data ? new this(data) : null;
	}


	public info(): APIEmbed {
		const embed: APIEmbed = {
			title: this.name,
			description: this.description
		};

		if (this.price) {
			const priceString = this.price.toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
			embed.fields = [{ name: '**Price**', value: priceString }];
		}

		return embed;
	}
}
