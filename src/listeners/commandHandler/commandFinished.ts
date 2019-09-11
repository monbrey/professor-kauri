import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { CommandStats, ICommandStats } from "../../models/commandStats";
import MongooseProvider from "../../providers/MongooseProvider";

export default class CommandFinishedListener extends Listener {
    private stats: MongooseProvider<ICommandStats>;

    constructor() {
        super("commandFinished", {
            emitter: "commandHandler",
            event: "commandFinished"
        });

        this.stats = new MongooseProvider<ICommandStats>(CommandStats, ["guild_id", "command_id"]);
        this.stats.init();
    }

    public async exec(message: Message, command: KauriCommand) {
        if (process.env.NODE_ENV !== "production") { return; }

        const key = message.guild ? `${message.guild.id}:${command.id}` : `dm:${command.id}`;
        const stat = this.stats.get(key);
        if (!stat) {
            this.stats.add(new CommandStats({
                guild_id: message.guild ? message.guild.id : "dm",
                command_id: command.id,
                count: 1
            }));
        } else { this.stats.set(key, "count", stat.count + 1); }
    }
}
