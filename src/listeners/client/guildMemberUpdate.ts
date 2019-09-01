import { Listener } from "discord-akairo";
import { GuildMember } from "discord.js";

export default class GuildMemberUpdateListener extends Listener {
    constructor() {
        super("guildMemberUpdate", {
            emitter: "client",
            event: "guildMemberUpdate"
        });
    }

    public async exec(oldMember: GuildMember, newMember: GuildMember) {
        if (oldMember.id === oldMember.guild.me!.id && newMember.nickname != null) {
            try {
                await newMember.setNickname("");
                if (newMember.guild.systemChannel) { newMember.guild.systemChannel.embed("Please don't weebify my name."); }
            } catch (e) { this.client.logger.parseError(e); }
            return this.client.logger.guildMemberUpdate(oldMember, newMember);
        }
    }
}
