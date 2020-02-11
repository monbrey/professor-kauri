import { stripIndents } from "common-tags";
import { GuildMember, Message, MessageEmbed } from "discord.js";
import emoji from "node-emoji";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { ITrainerDocument, Trainer } from "../../../models/trainer";

module.exports = class LadderCommand extends KauriCommand {
    constructor() {
        super("ELO Ladder", {
            aliases: ["ladder"],
            category: "Game",
            channel: "guild",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            description: "View the ELO rankings",
            requiresDatabase: true,
            usage: "ladder"
        });
    }

    public *args() {

    }

    public async exec(message: Message) {
        const data: ITrainerDocument[] = await Trainer.find({ "battleRecord.elo": { $not: { $eq: null } } })
            .select("_id battleRecord.elo")
            .sort({ "battleRecord.elo": -1 });

        if (data.length === 0)
            return new MessageEmbed()
                .setTitle("Nobody has joined this ladder yet")
                .setFooter("Partipate in ladder battles to raise your ranking!");

        const validMembers: GuildMember[] = data.filter(d => message.guild?.members.cache.has(d.id)).map(d => message.guild?.members.cache.get(d.id)!);
        const elos = validMembers.map(m => `${emoji.strip(m.displayName).padEnd(30, " ")} | ${m.trainer.battleRecord.elo}`);

        const ladder = stripIndents`**URPG ELO Ladder\`\`\`${"Battler".padEnd(30, " ")} | ELO\`\`\`**\`\`\`${elos.join("\n")}\`\`\``;

        return message.util!.send(ladder);
    }
};
