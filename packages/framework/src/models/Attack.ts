import { capitalCase } from "change-case";
import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import type { PokemonType } from "urpg.js";
import type { KauriClient } from "../client/KauriClient";
import { TypeColor } from "../util/Constants";
import { Database } from "../util/Database";

export interface AttackSchema {
	_id: number;
	name: string;
	type: string;
	description: string;
	power?: number;
	accuracy?: number;
	pp: number;
	category: string;
	contact?: boolean;
	sheerForce?: boolean;
	substitute?: boolean;
	snatch?: boolean;
	magicCoat?: boolean;
	list?: any[];
	additional?: string;
	note?: string;
	zmove?: string;
	maxmove?: string;
	metronome: boolean;
	tmNumber?: number;
	hmNumber?: number;
	price?: number;
}

export class Attack {
	public name: string;
	public type: PokemonType;
	public description: string;
	public power?: number;
	public accuracy?: number;
	public pp: number;
	public category: string;
	public contact: boolean;
	public sheerForce?: boolean;
	public substitute?: boolean;
	public snatch: boolean;
	public magicCoat: boolean;
	public list?: string[];
	public zmove?: string;
	public maxmove?: string;
	public metronome: boolean;
	public tmNumber?: number;
	public hmNumber?: number;
	public price?: number;

	constructor(data: AttackSchema) {
		this.name = data.name;
		this.type = data.type.toUpperCase() as PokemonType;
		this.description = data.description;
		this.power = data.power;
		this.accuracy = data.accuracy;
		this.pp = data.pp;
		this.category = data.category;
		this.contact = data.contact ?? false;
		this.sheerForce = data.sheerForce ?? false;
		this.substitute = data.substitute ?? false;
		this.snatch = data.snatch ?? false;
		this.magicCoat = data.magicCoat ?? false;
		this.list = data.list;
		this.zmove = data.zmove;
		this.maxmove = data.maxmove;
		this.metronome = data.metronome;
		this.tmNumber = data.tmNumber;
		this.hmNumber = data.hmNumber;
		this.price = data.price;
	}

	public static async fetch(client: KauriClient, value: string): Promise<Attack | null> {
		const data = await Database.findClosest("attack", "name", value);
		return data ? new this(data) : null;
	}

	public static async metronome(): Promise<Attack | null> {
		const database = await Database.getDb();
		const data = await database.collection("attack").aggregate([
			{ $match: { metronome: true } }, { $sample: { size: 1 } },
		]).toArray();
		return data ? new this(data[0]) : null;
	}

	public info(): MessageEmbed {
		const type = `Type: ${capitalCase(this.type)}`;
		const power = `Power: ${this.power ? this.power : "-"}`;
		const acc = `Accuracy: ${this.accuracy ? this.accuracy : "-"}`;
		const pp = `PP: ${this.pp}`;
		const cat = `Category: ${this.category}`;
		const contact = this.contact ? "Makes contact. " : "";
		const sf = this.sheerForce ? "Boosted by Sheer Force. " : "";
		const sub = this.substitute ? "Bypasses Substitute. " : "";
		const snatch = this.snatch ? "Can be Snatched. " : "";
		const mc = this.magicCoat ? "Can be reflected by Magic Coat. " : "";

		const propString = stripIndents`| ${type} | ${power} | ${acc} | ${pp} | ${cat} |
  
      ${this.description}
  
      ${contact}${sf}${sub}${snatch}${mc}`;

		const embed = new MessageEmbed()
			.setTitle(this.name)
			.setDescription(propString)
			.setColor(TypeColor[this.type]);

		if (this.list && this.list.length !== 0) embed.addField("**Helpful data**", this.list.join("\n"));
		if (this.price) {
			const priceString = this.price.toLocaleString("en-US", { style: "currency", currency: "USD" });
			if (this.tmNumber) {
				embed.addField("**TM**", `Taught by TM${this.tmNumber.toString().padStart(2, "0")} ($${priceString})`);
			} else if (this.hmNumber) {
				embed.addField("**HM**", `Taught by HM${this.hmNumber.toString().padStart(2, "0")} ($${priceString})`);
			}
		}

		if (this.zmove) embed.addField("**Z-Move**", this.zmove);
		if (this.maxmove) embed.addField("**Dynamax Move**", this.maxmove);

		return embed;
	}
}
