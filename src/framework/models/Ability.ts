import { ability } from '@prisma/client';
import { APIEmbed } from 'discord-api-types/v10';
import { findBestMatch } from 'string-similarity';
import { KauriClient } from '../client/KauriClient';

export class Ability {
	public readonly dbid: number;
	public readonly name: string;
	public readonly description: string;
	public readonly announcement: string;
	// public readonly affects?: string;

	private static list: string[] = [];
	private static listLastFetched = 0;

	public constructor(data: ability) {
		this.dbid = data.dbid;
		this.name = data.name;
		this.description = data.description;
		this.announcement = data.announcement;
		// this.affects = data.affects;
	}

	private static async getList(client: KauriClient) {
		const list = await client.database.ability.findMany({ select: { name: true } });
		this.list = list.map(x => x.name);
		this.listLastFetched = Date.now();
	}

	public static async fetch(client: KauriClient, value: string): Promise<Ability | null> {
		if (this.listLastFetched < Date.now() - (1000 * 60 * 60)) {
			await this.getList(client);
		}

		const { bestMatch } = findBestMatch(value, this.list);
		const data = await client.database.ability.findFirst({ where: { name: bestMatch.target } });

		return data ? new this(data) : null;
	}

	public info(): APIEmbed {
		const embed: APIEmbed = {
			description: this.description
		};

		switch (this.announcement) {
			case 'Activation':
				embed.title = `${this.name} | Announced on activation`;
				break;
			case 'Entry':
				embed.title = `${this.name} | Announced on entry`;
				break;
			case 'Hidden':
				embed.title = `${this.name} | Hidden`;
				break;
			default:
				embed.title = `${this.name}`;
		}

		// if (this.affects) embed.addFields({ name: "**Interacts with**", value: this.affects });
		// if (this.additional) embed.addFields({ name: '**Additional information**', value: this.additional });

		return embed;
	}
}

