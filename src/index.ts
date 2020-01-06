import { db } from "./util/db";

import KauriClient from "./client/KauriClient";

// Discord Extensions
require("./lib/structures/GuildTrainer");
require("./lib/structures/KauriGuild");
require("./lib/structures/KauriChannel");
require("./lib/structures/KauriMessage");

// Akairo Extensions
require("./lib/commands/KauriCommand");
require("./lib/commands/KauriCommandUtil");

// Other Extensions
require("./lib/misc/Model");
require("./lib/misc/Number");

const client = new KauriClient({
    disableEveryone: true,
    disabledEvents: [
        "TYPING_START",
        "VOICE_STATE_UPDATE",
        "VOICE_SERVER_UPDATE",
        "CHANNEL_PINS_UPDATE"
    ],
    partials: ["MESSAGE","CHANNEL","REACTION"]
});

db.once("connected", () => {
    client.start();
});
