import { Listener } from "discord-akairo";
import { Collection, Message, Snowflake } from "discord.js";

export default class MessageDeleteBulkListener extends Listener {
    constructor() {
        super("messageDeleteBulk", {
            emitter: "client",
            event: "messageDeleteBulk"
        });
    }

    public async exec(messages: Collection<Snowflake, Message>) {
        // const partials = messages.filter(m => m.partial).size;
        // console.log("Fired with", messages.size, "messages,", partials, "partial messages");
    }
}
