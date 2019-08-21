import dotenv from "dotenv";
import path from "path";
import KauriClient from "./client/KauriClient";

// tslint:disable: no-var-requires
// require("./structures/KauriGuild");
// require("./structures/KauriChannel");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const client = new KauriClient({
    disableEveryone: true,
    disabledEvents: [
        "TYPING_START",
        "VOICE_STATE_UPDATE",
        "VOICE_SERVER_UPDATE",
        "CHANNEL_PINS_UPDATE"
    ]
});

client.start();
