import { db } from "./util/db";

import KauriClient from "./client/KauriClient";

// Discord Extensions
import "./lib/structures/GuildTrainer";
import "./lib/structures/KauriGuild";
import "./lib/structures/KauriChannel";
import "./lib/structures/KauriMessage";

// Akairo Extensions
import "./lib/commands/KauriCommand";
import "./lib/commands/KauriCommandUtil";

// Other Extensions
import "./lib/mongoose/Model";
import "./lib/misc/Number";
import "./lib/misc/String";

const client = new KauriClient({
    disableEveryone: true,
    disabledEvents: [
        "TYPING_START",
        "VOICE_STATE_UPDATE",
        "VOICE_SERVER_UPDATE",
        "CHANNEL_PINS_UPDATE"
    ],
    partials: ["MESSAGE","CHANNEL","REACTION"]
}).start();
