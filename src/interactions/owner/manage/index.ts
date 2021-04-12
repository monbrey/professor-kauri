import { CommandInteraction } from "discord.js";
import { KauriInteraction } from "../../../lib/commands/KauriInteraction";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "manage",
      description: "Manage Slash Commands",
      defaultPermission: false,
      options: [{
        name: "commands",
        description: "Manage commands",
        type: "SUB_COMMAND",
        options: [{
          name: "action",
          description: "Endpoint to call",
          required: true,
          type: "STRING",
          choices: [
            { name: "Load", value: "load" },
            { name: "Reload", value: "reload" },
            { name: "Set Perms", value: "updatePermissions" },
            { name: "Delete", value: "delete" }
          ]
        }, {
          name: "command",
          description: "Command to be actioned",
          required: true,
          type: "STRING"
        }]
      }],
      permissions: [{
        id: "122157285790187530",
        type: "USER",
        permission: true
      }],
      guild: true,
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const action = args.get("action");
    const commandName = args.get("command");

    const command = this.handler.modules.get(commandName) as KauriInteraction | undefined;

    if (!command)
      return interaction.reply(`No command matching '${commandName}' found`, { ephemeral: true });

    switch (action) {
      case "load":
        await command.create();
        break;
      case "reload":
        await command.edit();
        break;
      case "bulk":
        await this.handler.setAll();
      case "delete":
        await command.delete();
        break;
      case "updatePermissions":
        await command.updatePermissions();
        break;
    }

    interaction.reply("Actioned");
  }
}