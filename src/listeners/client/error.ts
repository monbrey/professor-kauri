import { Listener } from "discord-akairo";

export default class ErrorListener extends Listener {
    constructor() {
        super("error", {
            emitter: "client",
            event: "error"
        });
    }

    public exec(error: Error) {
        console.error(error.stack);
    }
}
