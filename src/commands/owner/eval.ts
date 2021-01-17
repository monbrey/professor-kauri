const Discord = require("discord.js");
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
      const evaled = await eval(code);

      if (silent) {
        return;
      }

      if (evaled === undefined) {
        message.util!.send(
          new MessageEmbed({ color: 0xffffff, description: "No return value" })
        );
      }

      const stringified = inspect(evaled, { compact: false });

      if (stringified.length >= 2000) {
        try {
          const { id, html_url } = await fetch("https://api.github.com/gists", {
            method: "POST",
            body: JSON.stringify({
              files: {
                [`eval-${message.id}.txt`]: {
                  content: stringified
                }
              }
            }),
            headers: {
              "Accept": "application/vnd.github.v3+json",
              "Authorization": `token ${process.env.GIST_TOKEN}`,
              "Content-Type": "application/json"
            }
          }).then(res => res.json());

          message.util!.send(
            new MessageEmbed({
              color: 0xffffff,
              description: `Return value too long: uploaded to [Gist](${html_url})`
            })
          );

          this.client.setTimeout(this.deleteGist.bind(null, id), 300000);
        } catch (e) {
          await message.util!.send(
            new MessageEmbed({
              color: 0xffffff,
              description:
                "Response too long, and Github Gists appear to be down. Unable to post return value."
            })
          );
        }
      } else {
        await message.channel.send(this.clean(stringified), {
          code: "xl"
        });
      }
    } catch (e) {
      console.error(e);
      message.util!.send(
        new MessageEmbed({
          color: 0xff0000,
          description: `Fatal execution error in ${this.constructor.name}\n\`\`\`${inspect(e)}\`\`\``
        })
      );
    }
  }

  private clean(text: any) {
    if (typeof text === "string") {
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
      return text;
    }
  }

  private async deleteGist(id: string) {
    await fetch(`https://api.github.com/gists/${id}`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `token ${process.env.GIST_TOKEN}`
      },
      method: "DELETE"
    });
  }
}
