import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Color } from "../../models/color";
import { IPokemon, Pokemon as DbPokemon } from "../../models/mongo/pokemon";
import { Pokemon } from "../../models/Pokemon";

const sRanks = [
    { name: "easiest", min: 3000, max: 5000 },
    { name: "simple", min: 5000, max: 10000 },
    { name: "medium", min: 10000, max: 20000 },
    { name: "hard", min: 20000, max: 30000 },
    { name: "complex", min: 30000, max: 40000 },
    { name: "demanding", min: 40000, max: 55000 },
    { name: "merciless", min: 55000, max: 65000 },
    { name: "stupefying", min: 65000, max: 75000 }
];
const pRanks = [
    { name: "common", mcr: 8000 },
    { name: "uncommon", mcr: 16000 },
    { name: "rare", mcr: 25000 },
    { name: "legendary" }
];

interface CommandArgs {
    query: string;
}

export default class RankCommand extends KauriCommand {
    public constructor() {
        super("Rank Lookup", {
            aliases: ["rank"],
            category: "Info",
            description: "View all Pokemon of a specified rank",
            usage: ["rank <pokemon>", "rank <rank name>", "rank <park location>"],
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of a Rank or Pokemon to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        const sRank = sRanks.find(r => query.toLowerCase() === r.name);
        if (sRank) {
            const rankQ = new RegExp(`^${sRank.name}$`, "i");
            try {
                const rankedPokemon = await DbPokemon
                    .find({ $or: [{ "rank.story": rankQ }, { "rank.art": rankQ }] })
                    .sort("dexNumber")
                    .select("displayName dexNumber rank.story -_id");

                if (rankedPokemon.length !== 0) {
                    this.client.logger.rank(message, query, rankedPokemon.length);
                    return message.util!.send(this.outputByGen(rankedPokemon));
                }
            } catch (e) {
                e.key = "rank";
                throw e;
            }
        }

        const pRank = pRanks.find(r => query.toLowerCase() === r.name);
        if (pRank) {
            const rankQ = new RegExp(`^${pRank.name}$`, "i");
            try {
                const rankedPokemon = await DbPokemon.find({ "rank.park": rankQ })
                    .sort("dexNumber")
                    .select("displayName dexNumber parkLocation rank.park -_id");

                if (rankedPokemon.length !== 0) {
                    this.client.logger.rank(message, query, rankedPokemon.length);
                    return message.channel.send(this.outputByLocation(rankedPokemon));
                }
            } catch (e) {
                e.key = "rank";
                throw e;
            }
        }

        // Search by location
        try {
            // eslint-disable-next-line no-unused-vars
            const rankedPokemon = await DbPokemon.findAllClosest("parkLocation", query, 0.75);

            if (rankedPokemon && rankedPokemon.length !== 0) {
                this.client.logger.rank(message, query, rankedPokemon.length);
                return message.channel.send(this.outputByRank(rankedPokemon));
            }
        } catch (e) {
            e.key = "rank";
            throw e;
        }

        // Find the actual Pokemon
        try {
            const pokemon = query.match(/^\d+$/) ? await DbPokemon.findOne({ dexNumber: parseInt(query, 10) }) : await DbPokemon.findClosest("uniqueName", query);

            if (pokemon) {
                this.client.logger.rank(message, query, 1);
                const apiPokemon = new Pokemon(await this.client.urpgApi.pokemon.get(pokemon.uniqueName));
                return message.channel.send(await this.outputSingle(pokemon, apiPokemon));
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }

        return message.channel.embed("warn", `No Pokemon matching "${query}" could be found`);
    }

    private outputByGen(rankedPokemon: IPokemon[]) {
        const rank = rankedPokemon[0].rank!.story!;
        const sRank = sRanks.find(r => r.name === rank.toLowerCase());
        if (!sRank) { return; }
        const range = `${sRank.min.toLocaleString()} - ${sRank.max.toLocaleString()}`;

        const gens: { [index: string]: string[] } = {
            1: rankedPokemon.filter(p => p.dexNumber.between(1, 151)).map(p => p.displayName),
            2: rankedPokemon.filter(p => p.dexNumber.between(152, 251)).map(p => p.displayName),
            3: rankedPokemon.filter(p => p.dexNumber.between(252, 386)).map(p => p.displayName),
            4: rankedPokemon.filter(p => p.dexNumber.between(387, 493)).map(p => p.displayName),
            5: rankedPokemon.filter(p => p.dexNumber.between(494, 649)).map(p => p.displayName),
            6: rankedPokemon.filter(p => p.dexNumber.between(650, 721)).map(p => p.displayName),
            7: rankedPokemon.filter(p => p.dexNumber.between(722, 809)).map(p => p.displayName),
            8: rankedPokemon.filter(p => p.dexNumber >= 810).map(p => p.displayName)
        };

        const embed = new MessageEmbed().setTitle(`${rank} Story / Art Rank Pokemon | ${range} characters`);

        Object.keys(gens).forEach(key => { if (gens[key].length > 0) { embed.addField(`**Gen ${key}**`, gens[key].join(", ")); } });

        return embed;
    }

    private outputByLocation(rankedPokemon: IPokemon[]) {
        const rank = rankedPokemon[0].rank!.park!;
        const mcr = pRanks.find(r => r.name === rank.toLowerCase())!.mcr!.toLocaleString();

        const locations: { [index: string]: string[] } = {};
        for (const poke of rankedPokemon) {
            if (!poke.parkLocation) { continue; }
            if (!locations[poke.parkLocation]) { locations[poke.parkLocation] = []; }
            locations[poke.parkLocation].push(poke.displayName);
        }

        const embed = new MessageEmbed().setTitle(`${rank} Park Rank Pokemon | ${mcr} characters`);

        Object.keys(locations).forEach(key => { if (locations[key].length > 0) { embed.addField(`**${key}**`, locations[key].join(", ")); } });

        return embed;
    }

    private outputByRank(rankedPokemon: IPokemon[]) {
        const location = rankedPokemon[0].parkLocation!;

        const ranks: { [index: string]: string[] } = {};
        for (const poke of rankedPokemon) {
            if (!poke.rank || !poke.rank.park) { continue; }
            if (!ranks[poke.rank.park]) { ranks[poke.rank.park] = []; }
            ranks[poke.rank.park].push(poke.displayName);
        }

        const embed = new MessageEmbed().setTitle(`Park Pokemon found in ${location}`);

        Object.keys(ranks).forEach(key => { if (ranks[key].length > 0) { embed.addField(`**${key}**`, ranks[key].join(", ")); } });

        return embed;
    }

    private async outputSingle(pokemon: IPokemon, apiPokemon: Pokemon) {
        if (!pokemon.rank) { return; }
        const rank = pokemon.rank;

        const sRank = rank.story ? sRanks.find(r => r.name === rank.story!.toLowerCase()) : null;
        const aRank = rank.art ? sRanks.find(r => r.name === rank.art!.toLowerCase()) : null;
        const pRank = rank.park ? pRanks.find(r => r.name === rank.park!.toLowerCase()) : null;
        const prices = apiPokemon.prices;

        const embed = new MessageEmbed()
            .setTitle(`${pokemon.displayName} Ranks and Location`)
            .setColor(await Color.getColorForType(pokemon.type1.toLowerCase()));

        if (prices) embed.addField("**Purchase**", prices.join(" | "));

        embed.addField("**Story**", sRank ? `${rank.story} | ${sRank.min.toLocaleString()} - ${sRank.max.toLocaleString()} characters` : "Not available")
            .addField("**Art**", aRank ? `${rank.art}` : "Not available")
            .addField("**Park**", pRank ? `${rank.park} | ${pokemon.parkLocation} | ${pRank.mcr} characters` : "Not available");

        return embed;
    }
}
