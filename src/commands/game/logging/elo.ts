import { Argument } from "discord-akairo";
import { GuildMember, Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import KauriClient from "../../../client/KauriClient";
import { KauriCommand } from "../../../lib/commands/KauriCommand";

interface CommandArgs {
    winner: GuildMember;
    loser: GuildMember;
}

export default class EloCommand extends KauriCommand {
    constructor() {
        super("elo", {
            aliases: ["elo"],
            category: "Game",
            description: "Update the ELO ratings for two Battlers",
            channel: "guild",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public *args(message: Message) {
        const winner = yield {
            type: Argument.validate("member", member => member.id !== message.author.id)
        };

        const loser = yield {
            type: Argument.validate("member", member => member.id !== message.author.id)
        };

        return { winner, loser };
    }

    public async exec(message: Message, { winner, loser }: CommandArgs) {
        // Get current ratings
        const rA = winner.trainer.battleRecord?.elo || 1500;
        const rB = loser.trainer.battleRecord?.elo || 1500;

        // Calc expected ratings
        const eA = 1 / (1 + Math.pow(10, (rB - rA) / 400));
        const eB = 1 / (1 + Math.pow(10, (rA - rB) / 400));

        // Set K values
        const kA = rA > 2000 ? 24 : 32;
        const kB = rB > 2000 ? 24 : 32;

        // Calc new ratings
        const nA = Math.round(rA + kA * (1 - eA));
        const nB = Math.round(rB + kB * (0 - eB));

        const embed = new MessageEmbed()
            .setTitle("ELO Rating Update (Pending)")
            .addField("Battler", `${winner}\n${loser}`, true)
            .addField("ELO", `${rA} => ${nA}\n${rB} => ${nB}`, true)
            .setColor(0x1f8b4c)
            .setFooter("React to confirm the ELO changes");

        const prompt = await message.util!.send(embed);

        if (await prompt.reactConfirm(message.author.id)) {
            winner.trainer.battleRecord.elo = nA;
            loser.trainer.battleRecord.elo = nB;

            try {
                await Promise.all([winner.trainer.save(), loser.trainer.save()]);

                message.client.logger.elo(message, winner, loser);

                embed.setTitle("ELO Rating Update");
                delete embed.footer;
                await prompt.edit(embed);
            } catch (e) {
                message.client.logger.parseError(e);
            }
        } else return prompt.delete();
    }
}
