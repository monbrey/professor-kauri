import { Message } from "discord.js";
import { GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";

interface CommandArgs {
    member: GuildMember;
    amount: number;
    reason: string;
}

export default class CashModCommand extends KauriCommand {
    constructor() {
        super("Cash Modifier", {
            aliases: ["pay", "deduct"],
            category: "Game",
            description: "Adds or subtracts money for a trainer's account.",
            usage: ["pay <member> <amount>", "deduct <member> <amount>"],
            channel: "guild",
            defaults: { disabled: true }
        });
    }

    public *args(message: Message) {
        const alias = message.util?.parsed?.alias;

        const member = yield {
            type: "member",
            prompt: {
                start: `Which URPG member are you ${alias}ing?`,
                retry: new MessageEmbed().setDescription("Please mention someone, or provide their name (case-sensitive)").setFooter("Reply with \"cancel\" to end the command"),
                retries: 3
            }
        };

        const amount = yield {
            id: "amount",
            type: "integer",
            prompt: {
                start: `How much should I ${alias} ${member}`,
                retry: new MessageEmbed().setDescription("Please provide a valid integer > 0").setFooter("Reply with \"cancel\" to end the command"),
                retries: 3
            }
        };

        const reason = yield {
            match: "rest",
            prompt: {
                start: "What's the reason for this?",
            }
        };

        return { member, amount, reason };
    }

    public async exec(message: Message, { member, amount, reason }: CommandArgs) {
        const alias = message.util?.parsed?.alias;

        if (!member.trainer) {
            return message.channel.embed(
                "warn",
                `Could not find a Trainer profile for ${member}`
            );
        }

        const embed = new MessageEmbed()
            .setTitle(`${alias === "pay" ? "Payment to" : "Deduction from"} ${member.displayName} (Pending)`)
            .setDescription(reason)
            .addField("Amount", `${amount.to$()}`, true)
            .setFooter(`React to confirm that this ${alias === "pay" ? "payment" : "deduction"} is correct`);

        try {
            const prompt = await message.channel.send(embed);

            if (await prompt.reactConfirm(message.author!.id)) {
                prompt.reactions.removeAll();

                try {
                    await member.trainer.pay(alias === "pay" ? amount : -amount);
                } catch (e) {
                    this.client.logger.parseError(e);
                }

                embed
                    .setTitle(`${alias === "pay" ? "Payment to" : "Deduction from"} ${member.displayName}`)
                    .addField("Updated Balance", member.trainer.cash.to$());

                prompt.edit(embed);
                return this.client.logger[alias as "pay"|"deduct"](message, prompt);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
