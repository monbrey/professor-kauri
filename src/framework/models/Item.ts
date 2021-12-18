import { MessageEmbed } from "discord.js";
import type { KauriClient } from "../structures/KauriClient";
import { Database } from "../util/Database";


export interface ItemSchema {
	_id: number;
	name: string;
	description: string;
	category?: string[];
	price?: number;
}

export class Item {
	public name: any;
	public description: string;
	public category: string[] | undefined;
	public price: number | undefined;

	constructor(data: ItemSchema) {
		this.name = data.name;
		this.description = data.description;
		this.category = data.category;
		this.price = data.price;
	}

	public static async fetch(client: KauriClient, value: string): Promise<Item | null> {
		const data = await Database.findClosest("item", "name", value);
		return data ? new this(data) : null;
	}


	public info(): MessageEmbed {
		const embed = new MessageEmbed()
			.setTitle(this.name)
			.setDescription(this.description);

		if (this.price) {
			const priceString = this.price.toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			});
			embed.addFields({ name: "**Price**", value: priceString });
		}

		return embed;
	}
}
