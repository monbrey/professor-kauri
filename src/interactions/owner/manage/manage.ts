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

  private async commands(interaction: CommandInteraction, { action, command }: Record<string, string>) {
    const cmd = this.handler.modules.get(command) as KauriInteraction | undefined;

    if (!cmd)
      return interaction.reply(`No command matching '${command}' found`, { ephemeral: true });

    switch (action) {
      case "load":
        await cmd.create();
        return interaction.reply(`Command '${command}' loaded`);
      case "reload":
        await cmd.edit();
        return interaction.reply(`Command '${command}' reloaded`);
      case "bulk":
        await this.handler.setAll();
        return interaction.reply("All commands reloaded");
      case "delete":
        await cmd.delete();
        return interaction.reply(`Command '${command}' deleted`);
      case "updatePermissions":
        await cmd.updatePermissions();
        return interaction.reply(`Permissions set for '${command}'`);
      default:
        return interaction.reply(`No action matching '${action}' found`);
    }
  }

  public async exec(interaction: CommandInteraction, { subcommand }: Record<string, any>) {
    switch (subcommand.name) {
      case "commands":
        return this.commands(interaction, subcommand.options);
    }
  }
}