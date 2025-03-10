// import type { HexColorString, MessageEmbedOptions, Snowflake } from "discord.js";
// import type { KauriClient } from "../structures/KauriClient";
// import { Database } from "../../database";

// export type WeatherSchema = {
// 	_id: number;
// 	code: string;
// 	color: HexColorString;
// 	description: string;
// 	emoji: Snowflake | string;
// 	name: string;
// };

// export class Weather {
// 	public name;

// 	public code;

// 	public description;

// 	public color;

// 	public emoji;

// 	constructor(data: WeatherSchema) {
// 		this.name = data.name;
// 		this.code = data.code;
// 		this.description = data.description;
// 		this.color = data.color;
// 		this.emoji = data.emoji;
// 	}

// 	public static async fetch(client: KauriClient, value: string): Promise<Weather | null> {
// 		const data = await Database.findClosest("weather", "code", value);
// 		return data ? new this(data) : null;
// 	}

// 	public info(client: KauriClient): MessageEmbedOptions {
// 		return {
// 			title: `${client.emojis.cache.get(this.emoji) ?? this.emoji} ${this.name}`,
// 			description: this.description,
// 			color: this.color,
// 		};
// 	}
// }
