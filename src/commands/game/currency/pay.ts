import { Message } from "discord.js";
import { GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { TrainerData } from "../../../models/trainerData";

interface CommandArgs {
    trainer: GuildMember;
    amount: number;
    currency: string;
    reason: string;
}

export default class PayCommand extends KauriCommand {
    constructor() {
        super("pay", {
            aliases: ["pay"],
            category: "Game",
            description: "Adds money to a user's account",
            channel: "guild",
            defaults: { disabled: true }
        });
    }

    public *args() {
        const trainer = yield {
            type: "member",
            prompt: {
                start: "Which URPG member are you paying?",
                retry: "Please mention someone, or provide their name (case-sensitive)"
            }
        };

        const [amount, currency] = yield {
            id: "amount",
            type: "currency",
            prompt: {
                start: `How much is ${trainer} getting paid?`,
                retry: "Please provide a valid integer > 0",
                retries: 100
            }
        };

        const reason = yield {
            match: "rest",
            prompt: {
                start: `What's the reason for this payment?`,
            }
        };

        return { trainer, amount, currency, reason };
    }

    public async exec(message: Message, { trainer, amount, currency, reason }: CommandArgs) {
        const trainerData = await TrainerData.findById(trainer.id);
        if (!trainerData) {
            return message.channel.embed(
                "warn",
                `Could not find a Trainer profile for ${trainer}`
            );
        }

        const currencyString = currency === "$" ? `$${amount.toLocaleString()}` : `${amount.toLocaleString()} CC`;

        const embed = new MessageEmbed()
            .setTitle(`Payment to ${trainer.displayName} (Pending)`)
            .setDescription(reason)
            .addField("Amount", `${currencyString}`, true)
            .setFooter("React to confirm that this payment is correct");

        try {
            const prompt = await message.channel.send(embed);

            if (await prompt.reactConfirm(message.author!.id)) {
                prompt.reactions.removeAll();

                try {
                    if (currency === "$") {
                        await trainerData.modifyCash(amount);
                    } else {
                        await trainerData.modifyContestCredit(amount);
                    }
                } catch (e) {
                    this.client.logger.parseError(e);
                }

                embed
                    .setTitle(`Payment to ${trainer.displayName}`)
                    .addField("Updated Balance", trainerData.balanceString);

                prompt.edit(embed);
                return this.client.logger.pay(message, prompt);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
