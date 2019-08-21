import { Listener } from "discord-akairo";
import { TextChannel } from "discord.js";
import { MessageReaction } from "discord.js";

export default class RawListener extends Listener {
    [index: string]: any;

    constructor() {
        super("raw", {
            emitter: "client",
            event: "raw"
        });
    }

    public async MESSAGE_REACTION_ADD(data: any) {
        // Check if the message is cached, we dont want to process the event twice
        const channel = this.client.channels.get(data.channel_id) as TextChannel;
        if (channel.messages.has(data.message_id)) { return; }

        this.client.logger.raw(data);

        // Fetch it so it will be cached
        const message = await channel.messages.fetch(data.message_id);
        const emoji = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;

        // Get the actual reaction from the fetched message
        const reaction = message.reactions.get(emoji);

        // Finally, emit the event
        this.client.emit("messageReactionAdd", reaction, this.client.users.get(data.user_id));
    }

    public async MESSAGE_REACTION_REMOVE(data: any) {
        // Check if the message is cached, we dont want to process the event twice
        const channel = this.client.channels.get(data.channel_id) as TextChannel;
        if (channel.messages.has(data.message_id)) { return; }

        this.client.logger.raw(data);

        // Fetch it so it will be cached
        const message = await channel.messages.fetch(data.message_id);
        const emoji = data.emoji.id ? `${data.emoji.name} :${data.emoji.id}` : data.emoji.name;

        // Get the actual reaction from the fetched message
        const reaction = message.reactions.get(emoji);

        // Finally, emit the event
        this.client.emit("messageReactionRemove", reaction, this.client.users.get(data.user_id));
    }

    public async exec(data: any) {
        const eventName = data.t;
        const eventData = data.d;

        if (this[eventName]) {
            this[eventName](eventData);
        }
    }
}
