// Custom Client
import KauriClient from "./client/KauriClient";
// Akairo Extensions
import "./lib/commands/KauriCommand";
import "./lib/commands/KauriCommandUtil";
import "./lib/misc/Number";
import "./lib/misc/String";
// Mongoose Extensions
import "./lib/mongoose/Model";
// Discord Extensions
import "./lib/structures/GuildTrainer";
import "./lib/structures/KauriChannel";
import "./lib/structures/KauriGuild";
import "./lib/structures/KauriMessage";
// Utility
import "./util/db";

new KauriClient({
    allowedMentions: { parse: ["users", "roles"] },
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
}).start();