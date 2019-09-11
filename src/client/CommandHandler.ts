// Discord
import { CommandHandler } from "discord-akairo";
import { Message } from "discord.js";

// Bot
import MongooseProvider from "../providers/MongooseProvider";

// Models
import { Ability, IAbility } from "../models/ability";
import { IMove, Move } from "../models/move";
import { IPokemon, Pokemon } from "../models/pokemon";
import { ITrainer, Trainer } from "../models/trainer";

const TrainerProvider = new MongooseProvider<ITrainer>(Trainer, "_id");
const PokemonProvider = new MongooseProvider<IPokemon>(Pokemon, "uniqueName");
const AbilityProvider = new MongooseProvider<IAbility>(Ability, "moveName");
const MoveProvider = new MongooseProvider<IMove>(Move, "moveName");

export const addTypes = async (ch: CommandHandler) => {
    await Promise.all([TrainerProvider.init(), PokemonProvider.init(), AbilityProvider.init(), MoveProvider.init()]);

    ch.resolver.addType("pokemon", (message: Message, phrase: string) => {
        if (!phrase) return;
        return PokemonProvider.getClosest(phrase);
    });

    ch.resolver.addType("pokemonTeam", (message: Message, phrase: string) => {
        if (!phrase) return;
        return phrase.split(/,\s+?/).map(p => PokemonProvider.getClosest(p));
    });

    ch.resolver.addType("ability", (message: Message, phrase: string) => {
        if (!phrase) return;
        return AbilityProvider.getClosest(phrase);
    });

    ch.resolver.addType("move", (message: Message, phrase: string) => {
        if (!phrase) return;
        return MoveProvider.getClosest(phrase);
    });

    ch.resolver.addType("currency", (message: Message, phrase: string) => {
        const matches = /(\$)*([\d,]+)([cC]{2})*/.exec(phrase);
        if (!matches) { return null; }
        if (!matches[2]) { return null; }
        const a = parseInt(matches[2].replace(",", ""), 10);
        if (!a) { return null; }
        return [a, matches[3] ? "CC" : "$"];
    });
};
