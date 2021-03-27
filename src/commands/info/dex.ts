import { Argument } from "discord-akairo";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { Matched, Species } from "urpg.js";
import KauriClient from "../../client/KauriClient";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { KauriMessage } from "../../lib/structures/KauriMessage";
import { Pokemon } from "../../models/Pokemon";

interface CommandArgs {
  match: Matched<Species>;
}

interface DexMessage extends Message {
  pokemon: Pokemon;
  origAuthor: User;
}

export default class DexCommand extends KauriCommand {
  constructor() {
    super("Ultradex Lookup", {
      aliases: ["dex", "learnset"],
      category: "Info",
      description: "Get Ultradex data for a Pokemon",
      usage: ["dex <pokemon>", "learnset <pokemon>"],
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
    });
  }

  public *args(): any {
    const match = yield {
      type: "pokemon",
      match: "text",
      prompt: {
        start: "> Please provide the name of a Pokemon to lookup"
      }
    };

    return { match };
  }

  public async exec(message: Message, { match }: CommandArgs) {
    const alias = message.util?.parsed?.alias;
    const query = message.util && message.util.parsed ? message.util.parsed.content : undefined;

    const pokemon = new Pokemon(match.value);

    this.client.logger.info({
      key: alias,
      query,
      result: pokemon.name
    });

    try {
      if (message.token) {

      } else {
        const dex: Partial<DexMessage> = alias === "dex" ?
          await message.channel.send(
            "*Calling this command via messages has been deprecated and will be disabled in a future release.\nPlease use the `/dex` Slash Command in future*",
            await pokemon.dex(this.client as KauriClient, query)
          ) :
          await message.channel.send(await pokemon.learnset(query));
        dex.pokemon = pokemon;
        dex.origAuthor = message.author!;

        return alias === "dex" ? this.dexPrompt(dex as DexMessage) : this.backPrompt(dex as DexMessage);
      }
    } catch (e) {
      this.client.logger.parseError(e);
    }
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    await this.deferResponse(message.id, message.interaction.token);

    const arg = new Argument(this, { type: "pokemon", match: "text" }).process(message, args.get("query"));
    const pokemon = new Pokemon((await arg).value);

    this.client.logger.info({
      key: message.interaction.name,
      query: args.get("query"),
      result: pokemon.name
    });

    // @ts-ignore
    await this.updateResponse(message.interaction.token, {
      embeds: [(await pokemon.dex(this.client as KauriClient, args.get("query"), false)).toJSON()]
    });
  }

  private async dexPrompt(dex: DexMessage) {
    const emojis = ["🇲"];

    if (dex.pokemon.mega.length === 1) {
      const mp = dex.pokemon.mega[0].name.split("-")[1];
      emojis.push(mp === "Mega" ? "🇽" : "🇵");
    }
    if (dex.pokemon.mega.length === 2) emojis.push("🇽", "🇾");

    const filter = (reaction: MessageReaction, user: User) =>
      emojis.includes(reaction.emoji.name) && user.id === dex.origAuthor.id;

    for (const e of emojis) dex.react(e);
    const responses = await dex.awaitReactions(filter, { max: 1, time: 30000 });
    const response = responses.first();

    if (dex.guild) { await dex.reactions.removeAll(); }

    if (response) {
      switch (response.emoji.name) {
        case "🇲":
          await dex.edit(await dex.pokemon.learnset());
          break;
        case "🇽":
        case "🇵":
          await dex.edit(await dex.pokemon.megaDex(this.client as KauriClient, 0));
          break;
        case "🇾":
          await dex.edit(await dex.pokemon.megaDex(this.client as KauriClient, 1));
          break;
        default:
          const embed = new MessageEmbed(dex.embeds[0]).setFooter("");
          await dex.edit(embed);
      }
      this.backPrompt(dex);
    }
  }

  private async backPrompt(dex: DexMessage) {
    const filter = (reaction: MessageReaction, user: User) =>
      ["⬅️"].includes(reaction.emoji.name) && user.id === dex.origAuthor.id;

    await dex.react("⬅️");

    const responses = await dex.awaitReactions(filter, { max: 1, time: 30000 });
    const response = responses.first();

    if (dex.guild) { dex.reactions.removeAll(); }

    if (response?.emoji.name === "⬅️") {
      await dex.edit(await dex.pokemon.dex(this.client as KauriClient));
      this.dexPrompt(dex);
    }
    else {
      const embed = new MessageEmbed(dex.embeds[0]).setFooter("");
      dex.edit(embed);
    }
  }
}
