import { Message } from "discord.js";
import { KauriCommand } from "../lib/commands/KauriCommand";

export default class TestCommand extends KauriCommand {
  constructor() {
    super("test", {
      aliases: ["test"],
      ownerOnly: true
    });
  }

  public async exec(message: Message) {
    const sent = await message.channel.send("Test collector");

    const collector = sent.createReactionCollector(() => true, { dispose: true });
    await sent.react("👍");
    await sent.react("👎");

    collector.on("collect", (reaction, user) => console.log("collect"));
    collector.on("dispose", (reaction, user) => console.log("dispose"));
    collector.on("remove", (reaction, user) => console.log("remove"));
  }
}
