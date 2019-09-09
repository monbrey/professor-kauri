// Node
import { join } from "path";

// Discord
import { CommandHandler, PromptContentSupplier } from "discord-akairo";
import { Message } from "discord.js";

// Bot
import MongooseProvider from "../providers/MongooseProvider";
import KauriClient from "./KauriClient";

// Models
import { Flag } from "discord-akairo";
import { Ability, IAbility } from "../models/ability";
import { IMove, Move } from "../models/move";
import { IPokemon, Pokemon } from "../models/pokemon";
import { ITrainer, Trainer } from "../models/trainer";

const TrainerProvider = new MongooseProvider<ITrainer>(Trainer, "_id", true);
const PokemonProvider = new MongooseProvider<IPokemon>(Pokemon, "uniqueName", false);
const AbilityProvider = new MongooseProvider<IAbility>(Ability, "moveName", false);
const MoveProvider = new MongooseProvider<IMove>(Move, "moveName", false);

export const buildCommandHandler = (client: KauriClient) => {
    const ch = new CommandHandler(client, {
        argumentDefaults: { prompt: { cancel: "Command cancelled" } },
        directory: join(__dirname, "..", "commands"),
        commandUtil: true,
        commandUtilLifetime: 60000,
        fetchMembers: true,
        handleEdits: true,
        prefix: message => message.guild ? client.settings.get(message.guild.id, "prefix") || "!" : "!",
        storeMessages: true,
    });

    ch.resolver.addType("trainer", (message: Message, phrase: any) => {
        return TrainerProvider.get(phrase.id) || new Trainer({ _id: phrase.id });
    });

    ch.resolver.addType("otherTrainer", (message: Message, phrase: any) => {
        if (phrase.id === message.author!.id) return Flag.fail("author");
        return TrainerProvider.get(phrase.id) || new Trainer({ _id: phrase.id });
    });

    ch.resolver.addType("pokemon", (message: Message, phrase: string) => {
        return PokemonProvider.resolveClosest(phrase);
    });

    ch.resolver.addType("pokemonTeam", (message: Message, phrase: string) => {
        return phrase.split(/,?\s+/).map(p => PokemonProvider.resolveClosest(p));
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
