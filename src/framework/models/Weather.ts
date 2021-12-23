import type { HexColorString, MessageEmbedOptions, Snowflake } from "discord.js";
import type { KauriClient } from "../structures/KauriClient";
import { Database } from "../util/Database";

export interface WeatherSchema {
	_id: number;
	name: string;
	code: string;
	description: string;
	color: HexColorString;
	emoji: Snowflake | string;
}

export class Weather {
	public name;
	public code;
	public description;
	public color;
	public emoji;

	constructor(data: WeatherSchema) {
		this.name = data.name;
		this.code = data.code;
		this.description = data.description;
		this.color = data.color;
		this.emoji = data.emoji;
	}

	public static async fetch(client: KauriClient, value: string): Promise<Weather | null> {
		const data = await Database.findClosest("weather", "code", value);
		return data ? new this(data) : null;
	}

	public info(client: KauriClient): MessageEmbedOptions {
		return {
			title: `${client.emojis.cache.get(this.emoji) ?? this.emoji} ${this.name}`,
			description: this.description,
			color: this.color,
		};
	}
}
