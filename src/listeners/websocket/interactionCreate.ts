import { Listener } from "discord-akairo";
import KauriClient from "../../client/KauriClient";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { KauriMessage } from "../../lib/structures/KauriMessage";

export default class extends Listener {
    constructor() {
        super("interactionCreate", {
            emitter: "websocket",
            event: "INTERACTION_CREATE"
        });
    }

    public async exec(interaction: any) {
        const name = interaction.data.name;
        const command = this.client.commandHandler.findCommand(name) as KauriCommand;

        if (command?.interact) {
            const channel = this.client.channels.cache.get(interaction.channel_id);
            if (!channel?.isText()) return;

            const message = new KauriMessage(this.client as KauriClient, interaction, channel);

            const argsObject = interaction.data.options.reduce((a: any, v: any) => ({ ...a, [v.name]: v.value }), {});
            const args = await command.parse(message, argsObject.query);

            command.exec(message, args);

            // command.interact(interaction, args);
        }
    }
}
