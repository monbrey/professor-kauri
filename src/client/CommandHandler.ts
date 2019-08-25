import { CommandHandler } from "discord-akairo";
import { Message } from "discord.js";
import { join } from "path";
import { Pokemon } from "../models/pokemon";
import KauriClient from "./KauriClient";

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
        return Pokemon.findClosest("uniqueName", phrase);
    });

    ch.resolver.addType("currency", (message: Message, phrase: string) => {
        const matches = /(\$)*([\d,]+)([cC]{2})*/.exec(phrase);
        if (!matches) { return null; }
        if (!matches[2]) { return null; }
        const a = parseInt(matches[2].replace(",", ""), 10);
        if (!a) { return null; }
        console.log(matches);
        return [a, matches[3] ? "CC" : "$"];
    });

    return ch;
};
