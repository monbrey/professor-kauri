import { Message, MessageReaction, User } from "discord.js";
import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { IPokemon, Pokemon } from "../../models/pokemon";

interface CommandArgs {
    pokemon: IPokemon;
}

interface DexMessage extends Message {
    pokemon: IPokemon;
    origAuthor: User;
}

export default class DexCommand extends KauriCommand {
    constructor() {
        super("dex", {
            aliases: ["dex", "learnset"],
            category: "Info",
            description: "Get Ultradex data for a Pokemon",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public *args() {
        const pokemon = yield {
            type: "pokemon",
            match: "text",
            prompt: {
                start: "> Please provide the name of a Pokemon to lookup"
            }
        };

        return { pokemon };
    }

    public async exec(message: Message, { pokemon }: CommandArgs) {
        const alias = message.util?.parsed?.alias;
        const query = message.util && message.util.parsed ? message.util.parsed.content : undefined;

        this.client.logger.info({
            key: alias,
            query,
            result: pokemon.uniqueName
        });

        try {
            const dex: Partial<DexMessage> = alias === "dex" ?
                await message.channel.send(await pokemon.dex(query)) as Message :
                await message.channel.send(await pokemon.learnset(query)) as Message;
            dex.pokemon = pokemon;
            dex.origAuthor = message.author!;

            return alias === "dex" ? this.dexPrompt(dex as DexMessage) : this.backPrompt(dex as DexMessage);
        } catch (e) {
            this.client.logger.parseError(e);
        }

    }

    private async dexPrompt(dex: DexMessage) {
        // Set the default filter
        let filter = (reaction: MessageReaction, user: User) =>
            ["🇲"].includes(reaction.emoji.name) && user.id === dex.origAuthor.id;

        await dex.react("🇲");

        // One mega override
        if (dex.pokemon.mega.length === 1) {
            await dex.react("🇽");
            filter = (reaction, user) =>
                ["🇲", "🇽"].includes(reaction.emoji.name) && user.id === dex.origAuthor.id;
        }
        // Two mega override
        if (dex.pokemon.mega.length === 2) {
            await dex.react("🇽");
            await dex.react("🇾");
            filter = (reaction, user) =>
                ["🇲", "🇽", "🇾"].includes(reaction.emoji.name) && user.id === dex.origAuthor.id;
        }
        // Primal override
        if (dex.pokemon.primal.length === 1) {
            await dex.react("🇵");
            filter = (reaction, user) =>
                ["🇲", "🇵"].includes(reaction.emoji.name) && user.id === dex.origAuthor.id;
        }

        const response = await dex.awaitReactions(filter, { max: 1, time: 30000 });

        if (response.first()) {
            // Otherwise proceed through the workflow
            switch (response.first()!.emoji.name) {
                case "🇲":
                    await dex.edit(await dex.pokemon.learnset());
                    break;
                case "🇽":
                    await dex.edit(dex.pokemon.megaDex(0));
                    break;
                case "🇾":
                    await dex.edit(dex.pokemon.megaDex(1));
                    break;
                case "🇵":
                    await dex.edit(dex.pokemon.primalDex(0));
                    break;
            }
            if (dex.guild) { await dex.reactions.removeAll(); }
            this.backPrompt(dex);
        } else {
            const embed = new MessageEmbed(dex.embeds[0]);
            embed.setFooter("");
            await dex.edit(embed);
            if (dex.guild) { await dex.reactions.removeAll(); }

        }
    }

    private async backPrompt(dex: DexMessage) {
        const filter = (reaction: MessageReaction, user: User) =>
            ["⬅️"].includes(reaction.emoji.name) && user.id === dex.origAuthor.id;
        await dex.react("⬅️");

        const response = await dex.awaitReactions(filter, { max: 1, time: 30000 });

        if (response.first()?.emoji.name === "⬅️") {
            await dex.edit(await dex.pokemon.dex());
            if (dex.guild) { await dex.reactions.removeAll(); }
            this.dexPrompt(dex);
        }
        else {
            const embed = new MessageEmbed(dex.embeds[0]);
            embed.setFooter("");
            await dex.edit(embed);
            if (dex.guild) { dex.reactions.removeAll(); }
        }

        return;
    }
}
