import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

interface CommandArgs {
    die: string[];
}

export default class DiceCommand extends KauriCommand {
    constructor() {
        super("dice", {
            aliases: ["d", "dice"],
            category: "Game",
            description: "Rolls one or more x-sided dice",
        });
    }

    public *args() {
        const die = yield {
            type: "string",
            match: "separate"
        };

        return { die };
    }

    public async exec(message: Message, { die }: CommandArgs) {
        const valid = die.filter(d => /^[1-9]\d*(?:[,d]?[1-9]\d*)?$/.test(d));
        const dice: number[] = valid.flatMap(d => {
            if (!d.match(/[,d]/)) { return parseInt(d, 10); }
            if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && d.split(/[,d]/)[1] !== "") {
                if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && /^[1-9]\d*$/.test(d.split(/[,d]/)[1])) {
                    return new Array(parseInt(d.split(/[,d]/)[0], 10)).fill(d.split(/[,d]/)[1]);
                }
            }
        });

        const rolls = dice.map(d => Math.floor(Math.random() * d + 1));

        if (rolls.length === 0) {
            return message.util!.sendPopup(
                "warn",
                "None of the provide dice were valid. Valid formats are `#` and `#,#`"
            );
        }

        const response = await message.util!.sendPopup("info", `${message.author!.username} rolled ${rolls.join(", ")}`);
        return this.client.logger.dice(message, response.id, rolls.join(", "));
    }
}
