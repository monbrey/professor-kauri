// import { paginate } from "./plugins/paginator";
import { Message, MessageEmbed } from "discord.js";
import { connection, Document, model, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

import { Color } from "./color";
import { Mega } from "./mega";
import { IPokemonAbilityDocument, PokemonAbility } from "./schemas/pokemonAbility";
import { IPokemonEvolutionDocument, PokemonEvolution } from "./schemas/pokemonEvolution";
import { IPokemonMoveDocument, PokemonMove } from "./schemas/pokemonMove";
import { db } from "../util/db";

export interface IPokemonDocument extends Document {
    dexNumber: number;
    speciesName: string;
    uniqueName: string;
    displayName: string;
    spriteCode?: string;
    type1: string;
    type2?: string;
    abilities: IPokemonAbilityDocument[];
    moves: {
        level: IPokemonMoveDocument[];
        tm: IPokemonMoveDocument[];
        hm: IPokemonMoveDocument[];
        bm: IPokemonMoveDocument[];
        mt: IPokemonMoveDocument[];
        sm: IPokemonMoveDocument[];
    };
    evolution: IPokemonEvolutionDocument[];
    mega: Array<{
        megaId: number;
        displayName?: string;
    }>;
    primal: Array<{
        primalId: number;
        displayName?: string;
    }>;
    stats: {
        hp: number;
        attack: number;
        defence: number;
        specialAttack: number;
        specialDefence: number;
        speed: number;
    };
    height: number;
    weight: number;
    gender: {
        male?: boolean;
        female?: boolean;
    };
    martPrice?: {
        pokemart?: number;
        berryStore?: number;
    };
    rank?: {
        story?: string;
        art?: string;
        park?: string;
    };
    assets?: {
        image?: string;
        icon?: string;
    };
    parkLocation?: string;
    starterEligible: boolean;
    priceString: string;
}

export interface IPokemon extends IPokemonDocument {
    dex(query?: string): MessageEmbed;
    learnset(dex: Message): MessageEmbed;
    megaDex(whichMega: number): MessageEmbed;
    primalDex(whichPrimal: number): MessageEmbed;
}

export interface IPokemonModel extends Model<IPokemon> {
    getMartPokemon(page: number): any[];
    findExact(uniqueNames: string[], query?: any): IPokemon[];
    findOneExact(uniqueName: string, query?: any): IPokemon;
    findPartial(uniqueName: string, query?: any): IPokemon[];
}

const PokemonSchema = new Schema({
    dexNumber: { type: Number, required: true, index: true },
    speciesName: { type: String, required: true },
    uniqueName: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    spriteCode: { type: String },
    type1: { type: String, required: true },
    type2: { type: String },
    abilities: [PokemonAbility],
    moves: {
        level: [PokemonMove],
        tm: [PokemonMove],
        hm: [PokemonMove],
        bm: [PokemonMove],
        mt: [PokemonMove],
        sm: [PokemonMove]
    },
    evolution: [PokemonEvolution],
    mega: [{
        megaId: { type: Number, ref: "Mega" },
        displayName: { type: String },
        _id: false
    }],
    primal: [{
        primalId: { type: Number, ref: "Mega" },
        displayName: { type: String },
        _id: false
    }],
    stats: {
        hp: { type: Number, required: true },
        attack: { type: Number, required: true },
        defence: { type: Number, required: true },
        specialAttack: { type: Number, required: true },
        specialDefence: { type: Number, required: true },
        speed: { type: Number, required: true }
    },
    height: { type: Number },
    weight: { type: Number },
    gender: { male: { type: Boolean }, female: { type: Boolean } },
    martPrice: { pokemart: { type: Number }, berryStore: { type: Number } },
    rank: {
        story: { type: String },
        art: { type: String },
        park: { type: String }
    },
    assets: {
        image: { type: String },
        icon: { type: String }
    },
    parkLocation: { type: String },
    starterEligible: { type: Boolean, required: true }
}, { collection: "pokemon" });

PokemonSchema.plugin(autoIncrement, {
    model: "Pokemon",
    startAt: 1
});
// PokemonSchema.plugin(paginate);

PokemonSchema.virtual("priceString").get(function(this: IPokemon) {
    if (!this.martPrice) { return ""; }
    if (this.martPrice.pokemart && this.martPrice.berryStore) {
        return `$${this.martPrice.pokemart.toLocaleString()} | ${this.martPrice.berryStore.toLocaleString()} CC`;
    }
    if (this.martPrice.pokemart) { return `$${this.martPrice.pokemart.toLocaleString()}`; }
    if (this.martPrice.berryStore) { return `${this.martPrice.berryStore.toLocaleString()} CC`; }
});

PokemonSchema.statics.getMartPokemon = async function(page: number = 0) {
    return await this.paginate(
        { "martPrice.pokemart": { $not: { $eq: null } } },
        { select: "dexNumber uniqueName martPrice.pokemart" },
        (a: IPokemon, b: IPokemon) => {
            return a.dexNumber - b.dexNumber;
        },
        page,
        12
    );
};

PokemonSchema.statics.findExact = function(uniqueNames: string[], query: any = {}) {
    const namesRe = uniqueNames.map(name => new RegExp(`^${name}$`, "i"));
    return this.find(Object.assign(query, { uniqueName: { $in: namesRe } }));
};

PokemonSchema.statics.findOneExact = function(uniqueName: string, query: any = {}) {
    return this.findOne(Object.assign(query, { uniqueName: new RegExp(`^${uniqueName}$`, "i") }));
};

PokemonSchema.statics.findPartial = function(uniqueName: string, query: any = {}) {
    return this.find(Object.assign(query, { uniqueName: new RegExp(uniqueName, "i") }));
};

PokemonSchema.methods.dex = async function(query?: string) {
    const color = await Color.getColorForType(this.type1.toLowerCase());
    const dexString = this.dexNumber.toString().padStart(3, "0");
    const title = `URPG Ultradex - ${this.displayName} (#${dexString})`;
    const types = `${this.type1}${this.type2 ? ` | ${this.type2}` : ""}`;
    const abilities = this.abilities.map((a: IPokemonAbilityDocument) => (a.hidden ? `${a.abilityName} (HA)` : a.abilityName));
    const genders = Object.keys(this.gender.toObject())
        .filter(k => this.gender[k])
        .map(k => `${k.charAt(0).toUpperCase()}${k.slice(1)}`);

    const embed = new MessageEmbed()
        .setTitle(title)
        .setURL(`https://pokemonurpg.com/pokemon/${this.uniqueName}`)
        .setColor(color)
        .setThumbnail(this.assets.icon)
        .setImage(this.assets.image)
        .addField(`${this.type2 ? "Types" : "Type"}`, types)
        .addField("Abilities", abilities.join(" | "))
        .addField("Legal Genders", genders.length ? genders.join(" | ") : "Genderless")
        .addField("Height and Weight", `${this.height}m, ${this.weight}kg`)
        .setFooter("Reactions | [M] View Moves ");

    if (this.matchRating !== 1 && query) {
        const percent = Math.round(this.matchRating * 100);
        embed.setDescription(`Closest match to your search "${query}" with ${percent}% similarity`);
    }

    const rank = [];
    if (this.rank.story) { rank.push(`Story - ${this.rank.story}`); }
    if (this.rank.art) { rank.push(`Art - ${this.rank.art}`); }
    if (this.rank.park && this.parkLocation) {
        rank.push(`Park - ${this.rank.park} (${this.parkLocation})`);
    }
    if (rank.length) { embed.addField("Creative Ranks", rank.join(" | ")); }

    const prices = [];
    if (this.martPrice.pokemart) { prices.push(`${this.martPrice.pokemart.to$()}`); }
    if (this.martPrice.berryStore) { prices.push(`${this.martPrice.berryStore.to$()}`); }
    if (prices.length) { embed.addField("Price", `${prices.join(" | ")}`); }

    const stats: number[] = Object.values(this.stats.toObject());
    const statsStringArray = stats.map(s => s.toString().padEnd(3, " "));
    const statsStrings = `HP  | Att | Def | SpA | SpD | Spe\n${statsStringArray.join(" | ")}`;
    embed.addField("Stats", `\`\`\`${statsStrings}\`\`\``);

    if (this.mega.length === 1) { embed.footer!.text += "| [X] View Mega form"; }
    if (this.mega.length === 2) { embed.footer!.text += "| [X] View X Mega form | [Y] View Y Mega Form"; }
    if (this.primal.length === 1) { embed.footer!.text += "| [🇵] View Primal form"; }

    return embed;
};

PokemonSchema.methods.learnset = function(dex: Message) {
    const moveTypes: IPokemonMoveDocument[][] = (Object.values(this.moves.toObject()) as IPokemonMoveDocument[][]).slice(1);
    const moveCount = moveTypes.reduce((acc, obj) => acc + (obj ? obj.length : 0), 0);

    const embed = new MessageEmbed()
        .setTitle(`${this.displayName} can learn ${moveCount} move(s)`)
        .setColor(dex.embeds[0].color);

    let learnset: { [index: string]: string[] } = {};
    learnset = (Object.entries(this.moves) as [[string, IPokemonMoveDocument[]]])
        .slice(1).reduce((acc, [method, moves]) => {
            if (moves.length > 0) {
                acc[method] = moves.map(m => m.moveName);
            }
            return acc;
        }, learnset);

    // 1024 character splitter
    for (const method of Object.keys(learnset)) {
        learnset[method] = learnset[method].sort();
        let remainingLearnset = learnset[method].join(", ");
        let counter = 1;
        let pieces = Math.ceil(remainingLearnset.length / 1024);

        while (remainingLearnset.length > 1024) {
            const splitPoint = remainingLearnset.lastIndexOf(
                ", ",
                Math.floor(remainingLearnset.length / pieces--)
            );
            learnset[`${method}${counter++}`] = remainingLearnset
                .substring(0, splitPoint)
                .split(", ");
            remainingLearnset = remainingLearnset.substring(splitPoint + 2);
            delete learnset[method];
            if (remainingLearnset.length < 1024) {
                learnset[`${method}${counter++}`] = remainingLearnset.split(", ");
            }
        }
    }

    // Construct the embed fields
    if (learnset["level"]) { embed.addField("By Level", learnset["level"].join(", ")); }
    if (learnset["tm"]) { embed.addField("By TM", learnset["tm"].join(", ")); }
    if (learnset["tm1"]) { embed.addField("By TM", learnset["tm1"].join(", ")); }
    if (learnset["tm2"]) { embed.addField("By TM (cont)", learnset["tm2"].join(", ")); }
    if (learnset["tm3"]) { embed.addField("By TM (cont)", learnset["tm3"].join(", ")); }
    if (learnset["hm"]) { embed.addField("By HM", learnset["hm"].join(", ")); }
    if (learnset["bm"]) { embed.addField("By BM", learnset["bm"].join(", ")); }
    if (learnset["mt"]) { embed.addField("By MT", learnset["mt"].join(", ")); }
    if (learnset["sm"]) { embed.addField("By SM", learnset["sm"].join(", ")); }

    return embed;
};

PokemonSchema.methods.megaDex = async function(this: IPokemon, whichMega: number) {
    const mega = await Mega.findById(this.mega[whichMega].megaId);
    if (!mega) { return; }
    return mega.dex(this);
};

PokemonSchema.methods.primalDex = async function(this: IPokemon, whichPrimal: number) {
    const primal = await Mega.findById(this.primal[whichPrimal].primalId);
    if (!primal) { return; }
    return primal.dex(this);
};

export const Pokemon: IPokemonModel = db.model<IPokemon, IPokemonModel>("Pokemon", PokemonSchema);
