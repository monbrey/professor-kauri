import { Listener } from "discord-akairo";
import { DMChannel } from "discord.js";
import KauriClient from "../../client/KauriClient";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { KauriMessage } from "../../lib/structures/KauriMessage";
import { argMapper } from "../../util/argMapper";

export default class extends Listener {
  constructor() {
    super("interactionCreate", {
      emitter: "websocket",
      event: "INTERACTION_CREATE"
    });
  }

  public async exec(interaction: any) {
    console.log(interaction);
    const name = interaction.data.name;
    const command = this.client.commandHandler.findCommand(name) as KauriCommand;

    if (command?.interact) {
      const channel = this.client.channels.cache.get(interaction.channel_id) || new DMChannel(this.client, { id: interaction.channel_id });
      if(!channel?.isText()) return;

      const message = new KauriMessage(this.client as KauriClient, { ...interaction, author: interaction.member?.user || interaction.user }, channel);

      const args = argMapper(interaction.data.options ?? []);

      const inhibited = await command.handler.runPostTypeInhibitors(message, command);

      if (!inhibited) {
        command.interact(message, args);
      }
    }
  }
}
