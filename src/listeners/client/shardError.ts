import { Listener } from "discord-akairo";

export default class ShardErrorListener extends Listener {
    constructor() {
        super("shardError", {
            emitter: "client",
            event: "shardError"
        });
    }

    public async exec(error: Error, shardID: number) {
        console.error(error);
    }
}
