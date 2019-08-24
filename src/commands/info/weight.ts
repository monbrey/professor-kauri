import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Pokemon } from "../../models/pokemon";

interface CommandArgs {
    query: string;
    target: string;
}

module.exports = class WeightCommand extends KauriCommand {
    constructor() {
        super("weight", {
            aliases: ["weight"],
            category: "Info",
            separator: ",",
            description: "Provides information on weight-based moves for a specific Pokemon, or interaction between two Pokemon",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            prompt: {
                start: "> Please provide the name of a Pokemon to lookup"
            }
        };

        const target = yield {};

        return { query, target };
    }

    public async exec(message: Message, { query, target }: CommandArgs) {
        if (target) {
            const p1 = await Pokemon.findClosest("uniqueName", query);
            const p2 = await Pokemon.findClosest("uniqueName", target);
            if (p1 && p2) {
                this.client.logger.info({
                    key: "weight",
                    search: query,
                    result: `${p1.uniqueName} and ${p2.uniqueName}`
                });
                const embed = new MessageEmbed()
                    .setTitle(`${p1.uniqueName} vs ${p2.uniqueName}`)
                    .setDescription("Using Heat Crash or Heavy Slam")
                    .addField(`${p1.uniqueName}`, `${p1.weight}kg`, true)
                    .addField(`${p2.uniqueName}`, `${p2.weight}kg`, true)
                    .addField("Move Power", `${this.calcTwo(p1.weight, p2.weight)} BP`, true);

                return message.util!.send(embed);
            }
            if (!p1) {
                this.client.logger.info({ key: "dex", search: query, result: "none" });
                message.channel.sendPopup("warn", `No results found for ${query}`);
            }
            if (!p2) {
                this.client.logger.info({ key: "dex", search: target, result: "none" });
                message.channel.sendPopup("warn", `No results found for ${target}`);
            }
            return;
        }

        const pokemon = await Pokemon.findClosest("uniqueName", query);
        if (pokemon) {
            this.client.logger.info({
                key: "weight",
                search: query,
                result: pokemon.uniqueName
            });
            const embed = new MessageEmbed()
                .setTitle(pokemon.uniqueName)
                .setDescription("As the target of Grass Knot or Low Kick")
                .addField("Weight", `${pokemon.weight}kg`, true)
                .addField("Move Power", `${this.calcOne(pokemon.weight)} BP`, true);

            return message.channel.send(embed);
        } else {
            this.client.logger.info({ key: "dex", search: query, result: "none" });
            message.channel.sendPopup("warn", `No results found for ${query}`);
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
