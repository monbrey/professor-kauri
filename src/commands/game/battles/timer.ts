import { Argument } from "discord-akairo";
import { Collection, Message, Snowflake, SnowflakeUtil, TextChannel, User } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";

interface CommandArgs {
    operation: "set" | "clear" | "extend" | "pause" | "resume";
    duration?: number;
    users?: User[];
    target?: string;
}

interface BattleTimer {
    id: Snowflake;
    channel_id: string;
    users: string[];
    timeout: NodeJS.Timer;
    remaining: number;
    paused: boolean;
    pauseTimeout?: NodeJS.Timer;
}

export default class TimerCommand extends KauriCommand {
    private timers: Collection<string, BattleTimer> = new Collection<string, BattleTimer>();

    constructor() {
        super("Battle Turn Timer", {
            aliases: ["timer"],
            category: "Game",
            description: "Sets a timer on a battle turn. Set a battler's timer to 0 to cancel it.",
            usage: ["timer <duration> <battler(s)>"],
            channel: "guild",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public *args() {
        const operation = yield {
            default: "set",
            index: 0,
            type: ["set", "clear", "pause", "resume", "extend"]
        };

        if (operation === "set") {
            const duration = yield {
                index: 0,
                type: Argument.validate("number", (m, p) => parseInt(p, 10) > 1)
            };
            const users = yield {
                index: 1,
                match: "separate",
                type: "user",
            };

            return { operation, duration, users };
        }

        const target = yield {
            index: 1,
            type: "string"
        };

        if (["pause", "extend"].includes(operation)) {
            const duration = yield {
                index: 2,
                type: Argument.validate("number", (m, p) => parseInt(p, 10) > 1)
            };

            return { operation, duration, target };
        }

        return { operation, target };
    }

    private ping(id: Snowflake) {
        const timer = this.timers.get(id);
        if (!timer) return;

        if (timer.paused) return;

        timer.remaining--;

        const channel = this.client.channels.cache.get(timer.channel_id) as TextChannel;
        switch (timer.remaining) {
            case 0:
                channel.send(`${timer.users.map(u => `<@${u}>`).join(" ")}: Time's up!`);
                this.client.clearInterval(timer.timeout);
                return this.timers.delete(id);
            case 1:
                return channel.send(`${timer.users.map(u => `<@${u}>`).join(" ")}: 1 minute remaining`);
            default:
                return channel.send(`${timer.users.map(u => `<@${u}>`).join(" ")}: ${timer.remaining} minutes remaining`);
        }
    }

    private setTimer(message: Message, duration: number, users: string[]) {
        const id = SnowflakeUtil.generate();
        this.timers.set(id, {
            id,
            users,
            channel_id: message.channel.id,
            remaining: duration,
            timeout: this.client.setInterval(this.ping.bind(this), 5000, id),
            paused: false
        });
        return message.util!.send(`Timer set for ${duration}m. Timer ID: ${id}`);
    }

    private clearTimer(message: Message, target: string) {
        const timer = this.timers.get(target);
        if (!timer) return message.util!.send("No timer found");

        this.client.clearInterval(timer.timeout);
        this.timers.delete(target);

        return message.util!.send("Timer cleared");
    }

    private pauseTimer(message: Message, target: string, duration?: number) {
        const timer = this.timers.get(target);
        if (!timer) return message.util!.send("No timer found");

        timer.paused = true;
        if (duration)
            timer.pauseTimeout = this.client.setTimeout(() => timer.paused = false, duration * 1000, timer);

        return message.util?.send(`Timer paused${duration ? ` for ${duration}m`: ""}`);
    }

    private resumeTimer(message: Message, target: string) {
        const timer = this.timers.get(target);
        if (!timer) return message.util!.send("No timer found");
        if (!timer.paused) return message.util!.send("Timer is not paused");

        timer.paused = false;
        if (timer.pauseTimeout)
            this.client.clearTimeout(timer.pauseTimeout);

        return message.util?.send("Timer resumed");
    }

    private extendTimer(message: Message, target: string, duration: number) {
        const timer = this.timers.get(target);
        if (!timer) return message.util!.send("No timer found");

        timer.remaining += duration;

        return message.util?.send(`Timer extended by ${duration}m`);
    }

    public async exec(message: Message, { operation, duration, target, users }: CommandArgs) {
        switch (operation) {
            case "set":
                if (!duration || !users) return this.client.logger.parseError(new Error("Parameters missing from timer#set"));
                return this.setTimer(message, duration, users.map(u => u.id));
            case "clear":
                if (!target) return this.client.logger.parseError(new Error("Parameters missing from timer#clear"));
                return this.clearTimer(message, target);
            case "pause":
                if (!duration || !target) return this.client.logger.parseError(new Error("Parameters missing from timer#pause"));
                return this.pauseTimer(message, target, duration);
            case "resume":
                if (!target) return this.client.logger.parseError(new Error("Parameters missing from timer#resume"));
                return this.resumeTimer(message, target);
            case "extend":
                if (!duration || !target) return this.client.logger.parseError(new Error("Parameters missing from timer#extend"));
                return this.extendTimer(message, target, duration);
        }
    }
}
