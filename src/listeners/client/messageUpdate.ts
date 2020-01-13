import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class MessageUpdateListener extends Listener {
    constructor() {
        super("messageUpdate", {
            emitter: "client",
            event: "messageUpdate"
        });
    }

    public exec(oldMessage: Message, newMessage: Message) {
        if (!newMessage.member) return;
        if (newMessage.member.roles.size > 1) return;

        // Mention spam protection
        if (newMessage.mentions.users.size > 5)
            newMessage.member.ban({ days: 1, reason: "Mention spam from non-member" });

        // Message spam protection
        const count = newMessage.channel.messages.filter(m => m.author.id === newMessage.author.id && m.createdTimestamp > Date.now() - 2000).size;
        if (count > 5)
            newMessage.member.ban({ days: 1, reason: "Message spam from non-member" });
    }
}
