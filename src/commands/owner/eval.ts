import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { inspect } from "util";
import { KauriCommand } from "../../lib/commands/KauriCommand";

interface CommandArgs {
    code: string;
    silent: boolean;
}

export default class EvalCommand extends KauriCommand {
    constructor() {
        super("eval", {
            aliases: ["eval"],
            flags: ["-s"],
            category: "Util",
            ownerOnly: true,
            defaults: { configurable: false }
        });
    }

    public *args() {
        const code = yield {
            match: "content"
        };

        const silent = yield {
            match: "flag",
            flag: "-s"
        };

        return { code, silent };
    }

    public async exec(message: Message, { code, silent }: CommandArgs) {
        try {
            // tslint:disable-next-line: no-eval
            const evaled = await eval(code);

            if (silent) {
                return;
            }

            if (evaled === undefined) {
                return (await message.util!.send(
                    new MessageEmbed({ color: 0xffffff, description: "No return value" })
                )) as Message;
            }

            const stringified = inspect(evaled, { compact: false });

            if (stringified.length >= 2000) {
                try {
                    const { key } = await fetch("https://hasteb.in/documents", {
                        method: "POST",
                        body: stringified,
                        headers: { "Content-Type": "application/json" }
                    }).then(res => res.json());

                    return (await message.util!.send(
                        new MessageEmbed({
                            color: 0xffffff,
                            description: `Return value too long: uploaded to https://hasteb.in/${key}.js`
                        })
                    )) as Message;
                } catch (e) {
                    return (await message.util!.send(
                        new MessageEmbed({
                            color: 0xffffff,
                            description:
                                "Response too long, and hasteb.in appears to be down. Unable to post return value"
                        })
                    )) as Message;
                }
            } else {
                return (await message.channel.send(this.clean(stringified), {
                    code: "xl"
                })) as Message;
            }
        } catch (e) {
            console.error(e);
            return (await message.util!.send(
                new MessageEmbed({
                    color: 0xff0000,
                    description: `Fatal execution error in ${this.constructor.name}\n\`\`\`${e.stack}\`\`\``
                })
            )) as Message;
        }
    }

    private clean(text: any) {
        if (typeof text === "string") {
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else {
            return text;
        }
    }
}
