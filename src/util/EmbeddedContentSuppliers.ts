import { PromptContentSupplier } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

export class Failures {
    [index: string]: string;
}

export const runningStart = (name: string, value: string, reuse: boolean = false): PromptContentSupplier => {
    return (m, d) => {
        if (!m.util) throw new Error("No CommandUtil found, unable to continue prompting");

        const { lastResponse } = m.util;
        if (!lastResponse || !lastResponse.embeds[0]) return new MessageEmbed().addField(name, value);

        const embed = lastResponse.embeds[0];
        if (reuse) embed.fields[embed.fields.length - 1] = { name, value };
        else embed.addField(name, value);

        lastResponse.edit(embed);
        return;
    };
};

export const runningRetry = (reason: any | Failures, index?: number): PromptContentSupplier => {
    return (m, d) => {
        if (!m.util) throw new Error("No CommandUtil found, unable to continue prompting");

        const { lastResponse } = m.util;
        if (!lastResponse || !lastResponse.embeds[0]) throw new Error("No existing embed to modify on retry");

        const embed = lastResponse.embeds[0];

        if (reason instanceof Failures && d.failure && d.failure.value && reason[d.failure.value])
            embed.fields[index || embed.fields.length - 1].value = `${reason[d.failure.value]}`;
        else embed.fields[index || embed.fields.length - 1].value = `${reason}`;

        lastResponse.edit(embed);
        return;
    };
};

export const runningEnded = (m: Message, value: any, index?: number) => {
    if (!m.util) throw new Error("No CommandUtil found, unable to continue prompting");

    const { lastResponse } = m.util;
    if (!lastResponse || !lastResponse.embeds[0]) throw new Error("No existing embed to modify on end");

    const embed = lastResponse.embeds[0];
    embed.fields[index || embed.fields.length - 1].value = `${value}`;
    lastResponse.edit(embed);
    return;
};
