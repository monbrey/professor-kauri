import { Listener } from "discord-akairo";
import { GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";

export default class GuildMemberAddListener extends Listener {
    constructor() {
        super("guildMemberAdd", {
            emitter: "client",
            event: "guildMemberAdd"
        });
    }

    public async exec(member: GuildMember) {
        const embed = new MessageEmbed()
            .setTitle("Getting Started")
            .setDescription(
                `Welcome to the server! Interested in playing? You'll find everything you need to get started here.
                Just here to check it out? That's okay, too! Take your time and explore the game at your own pace.`
            )
            .setURL("https://pokemonurpg.com/general/getting-started/")
            .setColor(192537)
            .setThumbnail("https://pokemonurpg.com/img/info/general/urpg-logo-large.png")
            .setAuthor("Professor Kauri", this.client.user!.displayAvatarURL(), "https://pokemonurpg.com/")
            .setFooter("For a full list of this bots commands, type !help");

        this.client.logger.guildMemberAdd(member);

        try {
            return member.send(embed);
        } catch (e) {
            return this.client.logger.parseError(e);
        }
    }
}
