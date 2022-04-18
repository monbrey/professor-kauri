// import { capitalCase } from 'change-case';
import { attack, type } from '@prisma/client';
import { stripIndents } from 'common-tags';
import { APIEmbed } from 'discord-api-types/v10';
import { findBestMatch } from 'string-similarity';
import { KauriClient } from '../client/KauriClient';

export type AttackData = (attack & { type_attackTotype: type });

export class Attack {
	public dbid: number;
	public name: string;
	public type: type;
	public description: string;
	public power: number | null;
	public accuracy: number | null;
	// public pp: number;
	public category: string;
	// public contact: boolean;
	// public sheerForce: boolean;
	// public substitute: boolean;
	// public snatch: boolean;
	// public magicCoat: boolean;
	// public list?: string[];
	// public zmove?: string;
	// public maxmove?: string;
	// public metronome: boolean;
	// public tmNumber?: number;
	// public hmNumber?: number;
	// public price?: number;

	private static list: string[];
	private static listLastFetched: number;

	public constructor(data: AttackData) {
		this.dbid = data.dbid;
		this.name = data.name;
		this.type = data.type_attackTotype;
		this.description = data.description;
		this.power = data.power;
		this.accuracy = data.accuracy;
		// this.pp = data.pp;
		this.category = data.category;
		// this.contact = data.contact;
		// this.sheerForce = data.sheerForce;
		// this.substitute = data.substitute;
		// this.snatch = data.snatch;
		// this.magicCoat = data.magicCoat;
		// this.list = data.list;
		// this.zmove = data.zmove;
		// this.maxmove = data.maxmove;
		// this.metronome = data.metronome;
		// this.tmNumber = data.tmNumber;
		// this.hmNumber = data.hmNumber;
		// this.price = data.price;
	}

	private static async getList(client: KauriClient) {
		const list = await client.database.attack.findMany({ select: { name: true } });
		this.list = list.map(x => x.name);
		this.listLastFetched = Date.now();
	}

	public static async fetch(client: KauriClient, value: string): Promise<Attack | null> {
		if (this.listLastFetched < Date.now() - (1000 * 60 * 60)) {
			await this.getList(client);
		}

		const { bestMatch } = findBestMatch(value, this.list);
		const data = await client.database.attack.findFirst({
			where: {
				name: bestMatch.target
			},
			include: {
				type_attackTotype: true
			}
		});

		return data ? new this(data) : null;
	}

	// TODO: Reimplement once I figure out better DI or database randomisation
	// public static async metronome(): Promise<Attack> {
	// 	const database = await Database.getDb();
	// 	const data = await database.collection('attack').aggregate<AttackSchema>([
	// 		{ $match: { metronome: true } }, { $sample: { size: 1 } },
	// 	]).toArray();
	// 	if (!data) throw new Error('DB_READ_FAILED');
	// 	return new this(data[0]);
	// }

	public info(): APIEmbed {
		const type = `Type: ${this.type.name}`;
		const power = `Power: ${this.power ? this.power : '-'}`;
		const acc = `Accuracy: ${this.accuracy ? this.accuracy : '-'}`;
		// const pp = `PP: ${this.pp}`;
		const cat = `Category: ${this.category}`;
		// const contact = this.contact ? 'Makes contact. ' : '';
		// const sf = this.sheerForce ? 'Boosted by Sheer Force. ' : '';
		// const sub = this.substitute ? 'Bypasses Substitute. ' : '';
		// const snatch = this.snatch ? 'Can be Snatched. ' : '';
		// const mc = this.magicCoat ? 'Can be reflected by Magic Coat. ' : '';

		// const propString = stripIndents`| ${type} | ${power} | ${acc} | ${pp} | ${cat} |

		//   ${this.description}

		//   ${contact}${sf}${sub}${snatch}${mc}`;

		const propString = stripIndents`| ${type} | ${power} | ${acc} | ${cat} |

		  ${this.description}`;

		const embed: APIEmbed = {
			title: this.name,
			description: propString,
			color: this.type.color
		};

		// if (this.list && this.list.length !== 0) embed.addField('**Helpful data**', this.list.join('\n'));
		// if (this.price) {
		// 	const priceString = this.price.toLocaleString('en-US', {
		// 		style: 'currency',
		// 		currency: 'USD',
		// 		minimumFractionDigits: 0,
		// 		maximumFractionDigits: 0,
		// 	});
		// 	if (this.tmNumber) {
		// 		embed.addField('**TM**', `Taught by TM${this.tmNumber.toString().padStart(2, '0')} (${priceString})`);
		// 	} else if (this.hmNumber) {
		// 		embed.addField('**HM**', `Taught by HM${this.hmNumber.toString().padStart(2, '0')} (${priceString})`);
		// 	}
		// }

		// if (this.zmove) embed.addField('**Z-Move**', this.zmove);
		// if (this.maxmove) embed.addField('**Dynamax Move**', this.maxmove);

		return embed;
	}
}
