import { attack, ability, species, species_ability, species_attack, type } from '@prisma/client';
import { APIEmbed } from 'discord-api-types/v10';
import { findBestMatch } from 'string-similarity';
import type { KauriClient } from '../client/KauriClient';
import { Util } from '../util/Util';

export type SpeciesAbilityData = species_ability & ({
	ability: ability;
});

export type SpeciesAttackData = species_attack & ({
	attack: attack & ({
		type_attackTotype: type;
	});
});

export type SpeciesData = (species & {
	species_ability: SpeciesAbilityData[];
	species_attack: SpeciesAttackData[];
	type_species_type1Totype: type;
	type_species_type2Totype: type | null;
});

export class SpeciesAbility {
	public name: string;
	public description: string;
	public announcement: string;
	public hidden: boolean;

	public constructor(data: SpeciesAbilityData) {
		this.name = data.ability.name;
		this.description = data.ability.description;
		this.announcement = data.ability.announcement;
		this.hidden = data.hidden;
	}
}

export class SpeciesAttack {
	public name: string;
	public description: string;
	public type: type;
	public category: string;
	public power: number | null;
	public accuracy: number | null;
	public method: string;

	public constructor(data: SpeciesAttackData) {
		this.name = data.attack.name;
		this.description = data.attack.description;
		this.type = data.attack.type_attackTotype;
		this.category = data.attack.category;
		this.power = data.attack.power;
		this.accuracy = data.attack.accuracy;
		this.method = data.method;
	}
}

export class Species {
	public dbid: number;
	public dex_number: number;
	public name: string;
	// public displayName: string;
	// public formName: string;
	public type1: type;
	public type2: type | null;
	public abilities: SpeciesAbility[];
	public attacks: SpeciesAttack[];
	// public maleAllowed: boolean;
	// public femaleAllowed: boolean;

	public hp: number;
	public attack: number;
	public defense: number;
	public special_attack: number;
	public special_defense: number;
	public speed: number;

	public height: number;
	public weight: number;

	// public pokemart?: number;
	// public berryStore?: number;

	// public storyRank?: CreativeRank;
	// public artRank?: CreativeRank;
	// public parkRank?: CreativeRank;
	// public parkLocation?: Location;

	// public mega: PokemonMega[];

	private static list: string[];
	private static listLastFetched: number;

	// MatchRating?: number;

	public constructor(data: SpeciesData) {
		this.dbid = data.dbid;
		this.dex_number = data.dex_number;

		this.name = data.name;
		// this.displayName = data.displayName;
		// this.formName = data.formName;
		this.type1 = data.type_species_type1Totype;
		this.type2 = data.type_species_type2Totype;
		this.abilities = data.species_ability.map(sa => new SpeciesAbility(sa));
		this.attacks = data.species_attack.map(sa => new SpeciesAttack(sa));
		// this.maleAllowed = data.maleAllowed;
		// this.femaleAllowed = data.femaleAllowed;

		this.hp = data.hp;
		this.attack = data.attack;
		this.defense = data.defense;
		this.special_attack = data.special_attack;
		this.special_defense = data.special_defense;
		this.speed = data.speed;

		this.height = data.height;
		this.weight = data.weight;

		// this.pokemart = data.pokemart > 0 ? data.pokemart : undefined;
		// this.berryStore = data.contestCredits > 0 ? data.contestCredits : undefined;

		// this.storyRank = data.storyRank;
		// this.artRank = data.artRank;
		// this.parkRank = data.parkRank;
		// this.parkLocation = data.parkLocation;

		// this.mega = data.megaEvolutions || [];
		// this.mega.forEach(m => (m.type2 = m.type2 !== 'NONE' ? m.type2 : undefined));

		// This.matchRating = apiData.rating;
	}

	private static async getList(client: KauriClient) {
		const list = await client.database.attack.findMany({ select: { name: true } });
		this.list = list.map(x => x.name);
		this.listLastFetched = Date.now();
	}

	public static async fetch(client: KauriClient, value: string): Promise<Species | null> {
		if (this.listLastFetched < Date.now() - (1000 * 60 * 60)) {
			await this.getList(client);
		}

		const { bestMatch } = findBestMatch(value, this.list);
		const data = await client.database.species.findFirst({
			where: {
				name: bestMatch.target
			},
			include: {
				species_ability: {
					include: {
						ability: true
					}
				},
				species_attack: {
					include: {
						attack: {
							include: {
								type_attackTotype: true
							}
						}
					}
				},
				type_species_type1Totype: true,
				type_species_type2Totype: true
			}
		});

		return data ? new this(data) : null;
	}

	// public static async search(client: KauriClient, value: string, number = 20): Promise<Rating[]> {
	// 	const data = await client.urpg.species.listClosest(value, number);

	// 	if (!data) throw new Error('Not found');
	// 	return data.sort((a, b) => b.rating - a.rating);
	// }

	// public get genders(): string[] {
	// 	if (this.maleAllowed && this.femaleAllowed) return ['Male', 'Female'];
	// 	if (this.maleAllowed) return ['Male'];
	// 	if (this.femaleAllowed) return ['Female'];
	// 	return ['Genderless'];
	// }

	// public get prices(): string[] | null {
	// 	if (this.pokemart && this.berryStore) {
	// 		return [
	// 			`Pokemart: ${this.pokemart.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
	// 			`Berry Store: ${this.berryStore.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
	// 		];
	// 	}
	// 	if (this.pokemart) {
	// 		return [`Pokemart: ${this.pokemart.toLocaleString('en-US', {
	// 			style: 'currency',
	// 			currency: 'USD',
	// 		})}`];
	// 	}
	// 	if (this.berryStore) {
	// 		return [`Berry Store: ${this.berryStore.toLocaleString('en-US', {
	// 			style: 'currency',
	// 			currency: 'USD',
	// 		})}`];
	// 	}
	// 	return null;
	// }

	// public get ranks(): string[] | null {
	// 	const ranks = [];
	// 	if (this.storyRank) {
	// 		ranks.push(`Story: ${this.storyRank.name}`);
	// 	}
	// 	if (this.artRank) {
	// 		ranks.push(`Art: ${this.artRank.name}`);
	// 	}
	// 	if (this.parkRank && this.parkLocation) {
	// 		ranks.push(`Park: ${this.parkRank.name} (${this.parkLocation.name})`);
	// 	}

	// 	return ranks.length ? ranks : null;
	// }

	// public get stats(): PokemonStats {
	// 	const { hp, attack, defense, special_attack, special_defense, speed } = this;
	// 	return { hp, attack, defense, special_attack, special_defense, speed };
	// }

	public get suffix(): string {
		if (!this.name.includes('-')) return '';
		return `-${this.name.split('-')[1].toLowerCase()}`;
	}

	// public megaStats(index: number): PokemonStats {
	// 	const { hp, attack, defense, specialAttack, specialDefense, speed } = this.mega[index];
	// 	return { hp, attack, defense, specialAttack, specialDefense, speed };
	// }

	private attacksByMethod(method: string): string[] {
		return this.attacks.reduce<string[]>(
			(acc, val) => (val.method === method ? [...acc, val.name] : acc), []
		);
	}

	// public get icon(): string {
	// 	const variant = this.name.indexOf('-') > -1 ? `${this.name.slice(this.name.indexOf('-'))}` : '';
	// 	return `https://pokemonurpg.com/img/icons/${this.dex_number}${variant.toLowerCase() ?? ''}.png`;
	// }

	// public get sprite(): string {
	// 	const variant = this.name.indexOf('-') > -1 ? `${this.name.slice(this.name.indexOf('-'))}` : '';
	// 	return `https://pokemonurpg.com/img/sprites/${this.dex_number}${variant.toLowerCase() ?? ''}.gif`;
	// }

	public info(client: KauriClient, query?: string, rating?: number): APIEmbed {
		// const [t1, t2] = [client.getTypeEmoji(this.type1), client.getTypeEmoji(this.type2, true)];

		const stats = [this.hp, this.attack, this.defense, this.special_attack, this.special_defense, this.speed];
		const statsStringArray = stats.map(s => s.toString().padEnd(3, ' '));
		const statsStrings = `HP  | Att | Def | SpA | SpD | Spe\n${statsStringArray.join(' | ')}`;

		const title = `URPG Ultradex - ${this.name} (#${this.dex_number.toString().padStart(3, '0')})`;
		// const title = `URPG Ultradex - ${this.displayName}${this.formName ? ` - ${this.formName}` : ''} (#${this.dex_number
		// 	.toString()
		// 	.padStart(3, '0')})`;
		const url = `https://pokemonurpg.com/pokemon/${encodeURIComponent(this.name)}`;
		const color = this.type1.color;

		const fields = [
			{
				name: `**${this.type2 ? 'Types' : 'Type'}**`,
				// value: `${t1} ${capitalCase(this.type1)}${this.type2 ? ` | ${capitalCase(this.type2)} ${t2}` : ''}`,
				value: `${this.type1.name}${this.type2 ? ` | ${this.type2.name}` : ''}`
			},
			{
				name: '**Abilities**',
				value: this.abilities.map(a => (a.hidden ? `${a.name} (HA)` : a.name)).join(' | ')
			},
			// {
			// 	name: '**Legal Genders**',
			// 	value: this.genders.join(' | '),
			// },
			{
				name: '**Height and Weight**',
				value: `${this.height}m, ${this.weight}kg`
			},
			{
				name: '**Stats**',
				value: `\`\`\`${statsStrings}\`\`\``
			}
		];

		let description;
		if (query && rating && rating !== 1) {
			const percent = Math.round(rating * 100);
			description = `Closest match to your search "${query}" with ${percent}% similarity`;
		}

		// if (this.ranks) embed.addFields({ name: '**Creative Ranks**', value: this.ranks.join(' | ') });
		// if (this.prices) embed.addFields({ name: '**Price**', value: `${this.prices.join(' | ')}` });

		return {
			title, description, url, color, fields
		};
	}

	public learnset(query?: string, rating?: number): APIEmbed {
		const count = this.attacks.filter(a => a.method !== 'LEVEL-UP').length;

		const title = `${this.name} can learn ${count} move(s)`;
		const color = this.type1.color;

		let description;
		if (query && rating && rating !== 1) {
			const percent = Math.round(rating * 100);
			description = `Closest match to your search "${query}" with ${percent}% similarity`;
		}

		const learnset: { [index: string]: string[] } = {};

		if (this.attacks.find(a => a.method === 'LEVEL-UP')) learnset['By Level'] = this.attacksByMethod('LEVEL-UP');
		if (this.attacks.find(a => a.method === 'TM')) learnset['By TM'] = this.attacksByMethod('TM');
		if (this.attacks.find(a => a.method === 'HM')) learnset['By HM'] = this.attacksByMethod('HM');
		if (this.attacks.find(a => a.method === 'BREEDING')) learnset['By BM'] = this.attacksByMethod('BREEDING');
		if (this.attacks.find(a => a.method === 'MOVE TUTOR')) learnset['By MT'] = this.attacksByMethod('MOVE TUTOR');
		if (this.attacks.find(a => a.method === 'SPECIAL')) learnset['By SM'] = this.attacksByMethod('SPECIAL');

		// 1024 character splitter
		for (const method of Object.keys(learnset)) {
			learnset[method] = Util.splitMessage(learnset[method].sort((a, b) => a.localeCompare(b)).join(', '), {
				splitChar: ', ',
				maxLength: 1024
			});
		}

		const fields = Object.entries(learnset).map(([name, value]) =>
			value.length === 1
				? ({ name: `**${name}**`, value: value[0] })
				: value.map((v, i) => ({ name: `**${name} (${i + 1})**`, value: v })))
			.flat();

		return { title, color, description, fields };
	}
}

