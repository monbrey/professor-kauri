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

            const message = new KauriMessage(this.client as KauriClient, { ...interaction, author: interaction.member.user }, channel);

            const args = new Map(interaction.data.options.map((o: { name: string; value: any }) => [o.name, o.value]));

            const inhibited = await command.handler.runPostTypeInhibitors(message, command);

            if (!inhibited) {
                command.interact(message, args);
            }

            // command.interact(interaction, args);
        }
    }
}
