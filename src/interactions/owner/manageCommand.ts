import { CommandInteraction } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "manage-command",
      description: "Manage Slash Commands",
      defaultPermission: false,
      options: [{
        name: "action",
        description: "Endpoint to call",
        required: true,
        type: "STRING",
        choices: [
          { name: "Create Command", value: "create" },
          { name: "Refresh Command", value: "edit" },
          { name: "Update Permissions", value: "updatePermissions" },
          { name: "Delete Command", value: "delete" }
        ]
      }, {
        name: "command",
        description: "Command to be actioned",
        required: true,
        type: "STRING"
      }],
      permissions: [{
        id: "122157285790187530",
        type: 2,
        permission: true
      }],
      guild: true
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const action = args.get("action");
    const commandName = args.get("command");

    const command = this.handler.modules.get(commandName) as KauriInteraction | undefined;

    if (!command)
      return interaction.reply(`No command matching '${commandName}' found`, { ephemeral: true });

    switch (action) {
      case "create":
        command.create();
        break;
      case "edit":
        await command.edit();
        break;
      case "delete":
        command.delete();
        break;
      case "updatePermissions":
        command.updatePermissions();
        break;
    }

    interaction.reply("Actioned");
  }
}