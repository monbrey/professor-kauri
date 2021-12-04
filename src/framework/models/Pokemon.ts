import { capitalCase } from "change-case";
import { MessageEmbed, Util } from "discord.js";
import type { CreativeRank, Location, PokemonAbility, PokemonAttack, PokemonMega, PokemonType, Species } from "urpg.js";
import type { KauriClient } from "../structures/KauriClient";
import { TypeColor } from "../util/Constants";

interface PokemonStats {
	hp: number;
	attack: number;
	defense: number;
	specialAttack: number;
	specialDefense: number;
	speed: number;
}

export class Pokemon {
	name: string;
	displayName: string;
	formName: string;
	dexno: number;
	type1: PokemonType;
	type2?: PokemonType;
	abilities: PokemonAbility[];
	attacks: PokemonAttack[];
	maleAllowed: boolean;
	femaleAllowed: boolean;

	hp: number;
	attack: number;
	defense: number;
	specialDefense: number;
	specialAttack: number;
	speed: number;

	height: any;
	weight: any;

	pokemart?: number;
	berryStore?: number;

	storyRank?: CreativeRank;
	artRank?: CreativeRank;
	parkRank?: CreativeRank;
	parkLocation?: Location;

	mega: PokemonMega[];

	// MatchRating?: number;

	constructor(data: Species) {
		this.name = data.name;
		this.displayName = data.displayName;
		this.formName = data.formName;
		this.dexno = data.dexno;
		this.type1 = data.type1;
		this.type2 = data.type2;
		this.abilities = data.abilities;
		this.attacks = data.attacks;
		this.maleAllowed = data.maleAllowed;
		this.femaleAllowed = data.femaleAllowed;

		this.hp = data.hp;
		this.attack = data.attack;
		this.defense = data.defense;
		this.specialAttack = data.specialAttack;
		this.specialDefense = data.specialDefense;
		this.speed = data.speed;

		this.height = data.height;
		this.weight = data.weight;

		this.pokemart = data.pokemart > 0 ? data.pokemart : undefined;
		this.berryStore = data.contestCredits > 0 ? data.contestCredits : undefined;

		this.storyRank = data.storyRank;
		this.artRank = data.artRank;
		this.parkRank = data.parkRank;
		this.parkLocation = data.parkLocation;

		this.mega = data.megaEvolutions || [];
		this.mega.forEach(m => (m.type2 = m.type2 !== "NONE" ? m.type2 : undefined));

		// This.matchRating = apiData.rating;
	}

	public static async fetch(client: KauriClient, value: string): Promise<Pokemon> {
		const data = await client.urpg.species.fetchClosest(value);

		if (!data) throw new Error("Not found");
		return new this(data.value);
	}

	public get genders(): string[] {
		if (this.maleAllowed && this.femaleAllowed) return ["Male", "Female"];
		if (this.maleAllowed) return ["Male"];
		if (this.femaleAllowed) return ["Female"];
		return ["Genderless"];
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

	public get ranks(): string[] | null {
		const ranks = [];
		if (this.storyRank) {
			ranks.push(`Story: ${this.storyRank.name}`);
		}
		if (this.artRank) {
			ranks.push(`Art: ${this.artRank.name}`);
		}
		if (this.parkRank && this.parkLocation) {
			ranks.push(`Park: ${this.parkRank.name} (${this.parkLocation.name})`);
		}

		return ranks.length ? ranks : null;
	}

	public get stats(): PokemonStats {
		const { hp, attack, defense, specialAttack, specialDefense, speed } = this;
		return { hp, attack, defense, specialAttack, specialDefense, speed };
	}

	public get suffix(): string {
		if (!this.name.includes("-")) return "";
		return `-${this.name.split("-")[1].toLowerCase()}`;
	}

	public megaStats(index: number): PokemonStats {
		const { hp, attack, defense, specialAttack, specialDefense, speed } = this.mega[index];
		return { hp, attack, defense, specialAttack, specialDefense, speed };
	}

	private attacksByMethod(method: string): string[] {
		return this.attacks.reduce((acc, val) => (val.method === method ? [...acc, val.name] : acc), [] as string[]);
	}

	public get icon(): string {
		const variant = this.name.indexOf("-") > -1 ? `${this.name.slice(this.name.indexOf("-"))}` : "";
		return `https://pokemonurpg.com/img/icons/${this.dexno}${variant.toLowerCase() ?? ""}.png`;
	}

	public get sprite(): string {
		const variant = this.name.indexOf("-") > -1 ? `${this.name.slice(this.name.indexOf("-"))}` : "";
		return `https://pokemonurpg.com/img/sprites/${this.dexno}${variant.toLowerCase() ?? ""}.gif`;
	}

	dex(client: KauriClient, query?: string, rating?: number): MessageEmbed {
		const [t1, t2] = [client.getTypeEmoji(this.type1), client.getTypeEmoji(this.type2, true)];

		const stats = Object.values(this.stats);
		const statsStringArray = stats.map(s => s.toString().padEnd(3, " "));
		const statsStrings = `HP  | Att | Def | SpA | SpD | Spe\n${statsStringArray.join(" | ")}`;

		const embed = new MessageEmbed()
			.setTitle(
				`URPG Ultradex - ${this.displayName}${this.formName ? ` - ${this.formName}` : ""} (#${this.dexno
					.toString()
					.padStart(3, "0")})`,
			)
			.setURL(`https://pokemonurpg.com/pokemon/${encodeURIComponent(this.name)}`)
			.setColor(TypeColor[this.type1])
			.setThumbnail(this.icon)
			.setImage(this.sprite)
			.addFields([
				{
					name: `**${this.type2 ? "Types" : "Type"}**`,
					value: `${t1} ${capitalCase(this.type1)}${this.type2 ? ` | ${capitalCase(this.type2)} ${t2}` : ""}`,
				},
				{
					name: "**Abilities**",
					value: this.abilities.map(a => (a.hidden ? `${a.name} (HA)` : a.name)).join(" | "),
				},
				{
					name: "**Legal Genders**",
					value: this.genders.join(" | "),
				},
				{
					name: "**Height and Weight**",
					value: `${this.height}m, ${this.weight}kg`,
				},
				{
					name: "**Stats**",
					value: `\`\`\`${statsStrings}\`\`\``,
				},
			]);

		if (query && rating && rating !== 1) {
			const percent = Math.round(rating * 100);
			embed.setDescription(`Closest match to your search "${query}" with ${percent}% similarity`);
		}

		if (this.ranks) embed.addFields({ name: "**Creative Ranks**", value: this.ranks.join(" | ") });
		if (this.prices) embed.addFields({ name: "**Price**", value: `${this.prices.join(" | ")}` });

		return embed;
	}

	learnset(query?: string, rating?: number): MessageEmbed {
		const count = this.attacks.filter(a => a.method !== "LEVEL-UP").length;

		const embed = new MessageEmbed()
			.setTitle(`${this.displayName} can learn ${count} move(s)`)
			.setThumbnail(this.icon)
			.setColor(TypeColor[this.type1]);

		if (query && rating && rating !== 1) {
			const percent = Math.round(rating * 100);
			embed.setDescription(`Closest match to your search "${query}" with ${percent}% similarity`);
		}

		const learnset: { [index: string]: string[] } = {};

		if (this.attacks.find(a => a.method === "LEVEL-UP")) learnset["By Level"] = this.attacksByMethod("LEVEL-UP");
		if (this.attacks.find(a => a.method === "TM")) learnset["By TM"] = this.attacksByMethod("TM");
		if (this.attacks.find(a => a.method === "HM")) learnset["By HM"] = this.attacksByMethod("HM");
		if (this.attacks.find(a => a.method === "BREEDING")) learnset["By BM"] = this.attacksByMethod("BREEDING");
		if (this.attacks.find(a => a.method === "MOVE TUTOR")) learnset["By MT"] = this.attacksByMethod("MOVE TUTOR");
		if (this.attacks.find(a => a.method === "SPECIAL")) learnset["By SM"] = this.attacksByMethod("SPECIAL");

		// 1024 character splitter
		for (const method of Object.keys(learnset)) {
			learnset[method] = Util.splitMessage(learnset[method].sort((a, b) => a.localeCompare(b)).join(", "), {
				char: ", ",
				maxLength: 1024,
			});
		}

		for (const [name, value] of Object.entries(learnset)) {
			if (value.length === 1) embed.addFields({ name: `**${name}**`, value: value[0] });
			else embed.addFields(value.map((v, i) => ({ name: `**${name} (${i + 1})**`, value: v })));
		}

		return embed;
	}
}
