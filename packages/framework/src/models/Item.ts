import { MessageEmbed } from "discord.js";
import type { KauriClient } from "../client/KauriClient";
import { Database } from "../util/Database";


export interface ItemSchema {
	_id: number;
	name: string;
	description: string;
	category?: string[];
	pokemart?: number;
	berryStore?: number;
}

export class Item {
	public name: any;
	public description: string;
	public category: string[] | undefined;
	public pokemart: number | undefined;
	public berryStore: number | undefined;

	constructor(data: ItemSchema) {
		this.name = data.name;
		this.description = data.description;
		this.category = data.category;
		this.pokemart = data.pokemart;
		this.berryStore = data.berryStore;
	}

	public static async fetch(client: KauriClient, value: string): Promise<Item | null> {
		const data = await Database.findClosest("item", "name", value);
		return data ? new this(data) : null;
	}

	public get prices(): string[] | null {
		if (this.pokemart && this.berryStore) {
			return [
				`Pokemart: ${this.pokemart.toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
				`Berry Store: ${this.berryStore.toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
			];
		}
		if (this.pokemart) {
			return [`Pokemart: ${this.pokemart.toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
			})}`];
		}
		if (this.berryStore) {
			return [`Berry Store: ${this.berryStore.toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
			})}`];
		}
		return null;
	}

	public info(): MessageEmbed {
		const embed = new MessageEmbed()
			.setTitle(this.name)
			.setDescription(this.description);

		if (this.prices) embed.addFields({ name: "**Price**", value: `${this.prices.join(" | ")}` });

		return embed;
	}
}
