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

    public async exec(data: any) {
        const eventName = data.t;
        const eventData = data.d;

        // console.log(eventName);
    }
}
