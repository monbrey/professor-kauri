import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

interface CommandArgs {
    die: string[];
    verify: boolean;
}

export default class DiceCommand extends KauriCommand {
    constructor() {
        super("dice", {
            aliases: ["dice", "d"],
            category: "Game",
            flags: ["-v", "--verify"],
            description: "Rolls one or more x-sided dice",
        });
    }

    public *args() {
        const die = yield {
            type: "string",
            match: "separate"
        };

        const verify = yield {
            match: "flag",
            flag: ["-v", "--verify"]
        };

        return { die, verify };
    }

    public async exec(message: Message, { die, verify }: CommandArgs) {
        const valid = die.filter(d => /^[1-9]\d*(?:[,d]?[1-9]\d*)?$/.test(d));

        if (valid.length === 0) return;

        const dice: number[] = valid.flatMap(d => {
            if (!d.match(/[,d]/)) { return parseInt(d, 10); }
            if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && d.split(/[,d]/)[1] !== "") {
                if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && /^[1-9]\d*$/.test(d.split(/[,d]/)[1])) {
                    return new Array(parseInt(d.split(/[,d]/)[0], 10)).fill(d.split(/[,d]/)[1]);
                }
            }
        });

        const rolls = dice.map(d => Math.floor(Math.random() * d + 1));

        if (rolls.length === 0) return;

        const response = await message.util!.send({
            embed: {
                color: "WHITE",
                author: { name: message.member ? message.member.displayName : message.author!.username, icon_url: message.author!.displayAvatarURL() },
                fields: [
                    { name: rolls.length > 1 ? "Rolls" : "Roll", value: rolls.join(", "), inline: true },
                    { name: dice.length > 1 ? "Dice" : "Die", value: dice.join(", "), inline: true }
                ]
            }
        }) as Message;
        if (verify) response.edit(response.embeds[0].setFooter(`ID: ${response.id}`));
        return this.client.logger.dice(message, response.id, rolls.join(", "));
    }
}
