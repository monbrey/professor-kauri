// Node
import { join } from "path";

// Discord
import { CommandHandler } from "discord-akairo";
import { Message } from "discord.js";

// Bot
import MongooseProvider from "../providers/MongooseProvider";
import KauriClient from "./KauriClient";

// Models
import { Ability, IAbility } from "../models/ability";
import { IMove, Move } from "../models/move";
import { IPokemon, Pokemon } from "../models/pokemon";

const PokemonProvider = new MongooseProvider<IPokemon>(Pokemon, "uniqueName", false);
const AbilityProvider = new MongooseProvider<IAbility>(Ability, "moveName", false);
const MoveProvider = new MongooseProvider<IMove>(Move, "moveName", false);

export const buildCommandHandler = (client: KauriClient) => {

    const ch = new CommandHandler(client, {
        directory: join(__dirname, "..", "commands"),
        prefix: message => message.guild ? client.settings.get(message.guild.id, "prefix") || "!" : "!",
        handleEdits: true,
        storeMessages: true,
        commandUtil: true,
        commandUtilLifetime: 60000
    });

    ch.resolver.addType("pokemon", (message: Message, phrase: string) => {
        return PokemonProvider.resolveClosest(phrase);
    });

    ch.resolver.addType("ability", (message: Message, phrase: string) => {
        return AbilityProvider.resolveClosest(phrase);
    });

    ch.resolver.addType("move", (message: Message, phrase: string) => {
        return MoveProvider.resolveClosest(phrase);
    });

    ch.resolver.addType("currency", (message: Message, phrase: string) => {
        const matches = /(\$)*([\d,]+)([cC]{2})*/.exec(phrase);
        if (!matches) { return null; }
        if (!matches[2]) { return null; }
        const a = parseInt(matches[2].replace(",", ""), 10);
        if (!a) { return null; }
        return [a, matches[3] ? "CC" : "$"];
    });

    return ch;
};
