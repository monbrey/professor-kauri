import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Pokemon } from "../../models/pokemon";
import { IPokemon } from "urpg.js";

interface CommandArgs {
    query: IPokemon;
    target: IPokemon;
}

module.exports = class WeightCommand extends KauriCommand {
    constructor() {
        super("Weight", {
            aliases: ["weight"],
            category: "Info",
            separator: ",",
            description: "Provides information on weight-based moves for a specific Pokemon, or interaction between two Pokemon",
            usage: ["weight <pokemon>", "weight <attacker>, <target>"],
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "api-pokemon",
            prompt: {
                start: "> Please provide the name of a Pokemon to lookup"
            }
        };

        const target = yield {
            type: "api-pokemon"
        };

        return { query, target };
    }

    public async exec(message: Message, { query, target }: CommandArgs) {
        if (query && target) {
            // this.client.logger.info({
            //     key: "weight",
            //     search: query,
            //     result: `${query.name} and ${target.name}`
            // });
            const embed = new MessageEmbed()
                .setTitle(`${query.name} vs ${target.name}`)
                .setDescription("Using Heat Crash or Heavy Slam")
                .addField(`${query.name}`, `${query.weight}kg`, true)
                .addField(`${target.name}`, `${target.weight}kg`, true)
                .addField("Move Power", `${this.calcTwo(query.weight, target.weight)} BP`, true);

            return message.util!.send(embed);
        }

        if (query) {
            // this.client.logger.info({
            //     key: "weight",
            //     search: query,
            //     result: query.name
            // });
            const embed = new MessageEmbed()
                .setTitle(query.name)
                .setDescription("As the target of Grass Knot or Low Kick")
                .addField("Weight", `${query.weight}kg`, true)
                .addField("Move Power", `${this.calcOne(query.weight)} BP`, true);

            return message.channel.send(embed);
        } else {
            // this.client.logger.info({ key: "dex", search: query, result: "none" });
            message.channel.embed("warn", `No results found for ${query}`);
        }
    }

    private calcOne(weight: number) {
        if (weight.between(0.1, 10)) { return 20; }
        if (weight.between(10.1, 25)) { return 40; }
        if (weight.between(25.1, 50)) { return 60; }
        if (weight.between(50.1, 100)) { return 80; }
        if (weight.between(100.1, 200)) { return 100; }
        if (weight >= 200.1) { return 120; }

        return 0;
    }

    private calcTwo(user: number, target: number) {
        const ratio = Math.floor(user / target);

        if (ratio <= 1) { return 40; }
        if (ratio === 2) { return 60; }
        if (ratio === 3) { return 80; }
        if (ratio === 4) { return 100; }
        if (ratio >= 5) { return 120; }

        return 0;
    }
};
