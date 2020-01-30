import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class MessageListener extends Listener {
    constructor() {
        super("message", {
            emitter: "client",
            event: "message"
        });
    }

    public exec(message: Message) {
        if (!message.member) return;
        if (message.member.roles.size > 1) return;

        // Mention spam protection
        if (message.mentions.users.size > 5)
            message.member.ban({ days: 1, reason: "Mention spam from non-member" });

        // Message spam protection
        const count = message.channel.messages.filter(m => m.author?.id === message.author.id && m.createdTimestamp > Date.now() - 2000).size;
        if (count > 5)
            message.member.ban({ days: 1, reason: "Message spam from non-member" });
    }
}
