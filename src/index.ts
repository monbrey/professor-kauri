import dotenv from "dotenv";
import path from "path";
import KauriClient from "./client/KauriClient";

// tslint:disable: no-var-requires
require("./extensions/structures/KauriGuild");
require("./extensions/structures/KauriChannel");
require("./extensions/Model");
require("./extensions/Number");
require("./extensions/CommandUtil");

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
