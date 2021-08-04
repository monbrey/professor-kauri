import { MessageEmbed } from "discord.js";
import type { KauriClient } from "../client/KauriClient";

export interface AbilitySchema {
	_id: number;
	name: string;
	description: string;
	announcement?: string;
	affects?: string;
	info: MessageEmbed;
}

export class Ability {
	public name: string;
	public description: string;
	public announcement?: string;
	public affects?: string;

	constructor(data: AbilitySchema) {
		this.name = data.name;
		this.description = data.description;
		this.announcement = data.announcement;
		this.affects = data.affects;
	}

	public static async fetch(client: KauriClient, value: string): Promise<Ability | null> {
		const database = await client.getDatabase();
		const data = await database.collection("ability").findOne({ name: value });

		return data ? new this(data) : null;
	}

	public info(): MessageEmbed {
		const embed = new MessageEmbed().setDescription(this.description);

		switch (this.announcement) {
			case "Active":
				embed.setTitle(`${this.name} | Announced on activation`);
				break;
			case "Enter":
				embed.setTitle(`${this.name} | Announced on entry`);
				break;
			case "Hidden":
				embed.setTitle(`${this.name} | Hidden`);
				break;
			default:
				embed.setTitle(`${this.name}`);
		}

		if (this.affects) embed.addFields({ name: "**Interacts with**", value: this.affects });
		// if (this.additional) embed.addFields({ name: '**Additional information**', value: this.additional });

		return embed;
	}
}

