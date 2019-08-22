// tslint:disable: no-var-requires

import dotenv from "dotenv";
import path from "path";
import KauriClient from "./lib/client/KauriClient";

// Extends Structures
require("./extensions/structures/KauriGuild");
require("./extensions/structures/KauriChannel");

// Akairo Extensions
require("./extensions/Command");
require("./extensions/CommandUtil");

// Other Extensions
require("./extensions/Model");
require("./extensions/Number");

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
