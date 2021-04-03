import { createCanvas, loadImage } from "canvas";
import { MessageAttachment } from "discord.js";
import { join } from "path";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { KauriMessage } from "../../lib/structures/KauriMessage";


export default class extends KauriCommand {
  public constructor() {
    super("trainer-profile", {
      aliases: ["profile"],
      category: "Trainer",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Provides information about the bot and its commands",
    });
  }

  public async exec(message: KauriMessage, args: Map<string, any>) {
    const canvas = createCanvas(245, 171);
    const ctx = canvas.getContext("2d");

    const image = await loadImage(join(__dirname, "assets", "grey.png"));
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(message.author.username, 15, 45);


    message.channel.send({ files: [new MessageAttachment(canvas.toBuffer())] });
  }
}