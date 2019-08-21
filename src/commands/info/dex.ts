import { Command } from "discord-akairo";
import { Message, MessageReaction, User } from "discord.js";
import { MessageEmbed } from "discord.js";
import { IPokemon, Pokemon } from "../../models/pokemon";

interface CommandArgs {
    query: string;
}

interface DexMessage extends Message {
    pokemon: IPokemon;
    orig_author: User;
}

export default class DexCommand extends Command {
    constructor() {
        super("dex", {
            aliases: ["dex"],
            category: "Info",
            description: "Get Ultradex data for a Pokemon",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of a Pokemon to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        try {
            const pokemon = await Pokemon.findClosest("uniqueName", query);

            if (pokemon) {
                this.client.logger.info({
                    key: "dex",
                    query,
                    result: pokemon.uniqueName
                });

                const dex: Partial<DexMessage> = await message.channel.send(await pokemon.dex(query)) as Message;
                dex.pokemon = pokemon;
                dex.orig_author = message.author!;

                return this.prompt(dex as DexMessage);
            } else {
                this.client.logger.info({ key: "dex", query, result: "none" });
                return message.channel.sendPopup("warn", `No results found for ${query}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }

    private async prompt(dex: DexMessage) {
        // Set the default filter
        let filter = (reaction: MessageReaction, user: User) =>
            ["🇲"].includes(reaction.emoji.name) && user.id === dex.orig_author.id;
        await dex.react("🇲");

        // One mega override
        if (dex.pokemon.mega.length === 1) {
            await dex.react("🇽");
            filter = (reaction, user) =>
                ["🇲", "🇽"].includes(reaction.emoji.name) && user.id === dex.orig_author.id;
        }
        // Two mega override
        if (dex.pokemon.mega.length === 2) {
            await dex.react("🇽");
            await dex.react("🇾");
            filter = (reaction, user) =>
                ["🇲", "🇽", "🇾"].includes(reaction.emoji.name) && user.id === dex.orig_author.id;
        }
        // Primal override
        if (dex.pokemon.primal.length === 1) {
            await dex.react("🇵");
            filter = (reaction, user) =>
                ["🇲", "🇵"].includes(reaction.emoji.name) && user.id === dex.orig_author.id;
        }

        const response = await dex.awaitReactions(filter, { max: 1, time: 30000 });

        if (response.first()) {
            // Otherwise proceed through the workflow
            switch (response.first()!.emoji.name) {
                case "🇲":
                    await dex.edit(dex.pokemon.learnset(dex));
                    break;
                case "🇽":
                    await dex.edit(await dex.pokemon.megaDex(0));
                    break;
                case "🇾":
                    await dex.edit(await dex.pokemon.megaDex(1));
                    break;
                case "🇵":
                    await dex.edit(await dex.pokemon.primalDex(0));
                    break;
            }
        } else {
            const embed = new MessageEmbed(dex.embeds[0]);
            embed.setFooter("");
            await dex.edit(embed);
        }

        if (dex.guild) { dex.reactions.clear(); }
        return;
    }
}
