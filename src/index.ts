import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import KauriClient from "./client/KauriClient";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

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

mongoose.connect(process.env.MONGODB_URI!, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    w: "majority"
});
mongoose.set("useCreateIndex", true);

const db = mongoose.connection;

const client = new KauriClient({
    disableEveryone: true,
    disabledEvents: [
        "TYPING_START",
        "VOICE_STATE_UPDATE",
        "VOICE_SERVER_UPDATE",
        "CHANNEL_PINS_UPDATE"
    ]
});

db.once("connected", () => {
    client.start();
});
