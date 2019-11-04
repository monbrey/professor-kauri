import { stripIndents } from "common-tags";
import { GuildMember, Message } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { ITrainerDocument, Trainer } from "../../../models/trainer";
import emoji from "node-emoji";

module.exports = class LadderCommand extends KauriCommand {
    constructor() {
        super("ladder", {
            aliases: ["ladder"],
            category: "Game",
            description: "View the ELO rankings",
            channel: "guild",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public *args() {

    }

    public async exec(message: Message) {
        const data: ITrainerDocument[] = await Trainer.find({ "battleRecord.elo": { $not: { $eq: null } } })
            .select("_id battleRecord.elo")
            .sort({ "battleRecord.elo": -1 });

        const validMembers: GuildMember[] = data.filter(d => message.guild?.members.has(d.id)).map(d => message.guild?.members.get(d.id)!);
        const elos = validMembers.map(m => `${emoji.strip(m.displayName).padEnd(30, " ")} | ${m.trainer.battleRecord.elo}`);

        const ladder = stripIndents`**URPG ELO Ladder\`\`\`${"Battler".padEnd(30, " ")} | ELO\`\`\`**\`\`\`${elos.join("\n")}\`\`\``;

        return message.util!.send(ladder);
    }
};
