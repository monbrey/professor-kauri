// tslint:disable: no-var-requires

import dotenv from "dotenv";
import path from "path";
import KauriClient from "./client/KauriClient";

// Extends Structures
require("./lib/structures/KauriGuild");
require("./lib/structures/KauriChannel");

// Akairo Extensions
require("./lib/commands/KauriCommand");
require("./lib/commands/KauriCommandUtil");

// Other Extensions
require("./lib/misc/Model");
require("./lib/misc/Number");

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
