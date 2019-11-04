import { DMChannel, MessageReaction, Snowflake, Structures, TextChannel, User } from "discord.js";
import KauriClient from "../../client/KauriClient";

declare module "discord.js" {
    interface Message {
        client: KauriClient;
        reactConfirm(listenTo: Snowflake, timeout?: number): Promise<boolean>;
        paginate(listenTo: Snowflake, back: boolean, next: boolean, timeout?: number): Promise<boolean>;
    }
}

Structures.extend("Message", Message => {
    class KauriMessage extends Message {
        constructor(client: KauriClient, data: object, channel: TextChannel | DMChannel) {
            super(client, data, channel);
        }

        /**
         * Adds confirmation reactions to the message and listens to the response
         * @param {Snowflake} [listenTo=''] The ID of the user to listen to
         * @param {number} [timeout=30000] How long to wait for reactions
         * @returns {Promise<boolean>}
         */
        public async reactConfirm(listenTo: Snowflake, timeout = 60000) {
            await this.react("✅");
            await this.react("❌");

            const filter = ({ emoji }: MessageReaction, u: User) =>
                ["✅", "❌"].includes(emoji.name) && u.id === listenTo;
            const response = await this.awaitReactions(filter, {
                max: 1,
                time: timeout
            });

            if (!response.first()) { return false; }
            return response.first()!.emoji.name === "✅" ? true : false;
        }

        /**
         * Adds pagination controls to the message and listens to the response
         * @param {String}      [listenTo=''] - The ID of the user to listen to
         * @param {Boolean}     [back] - Should the back button be displayed
         * @param {Boolean}     [next] - Should the next button be displayed
         * @param {number}      [timeout=30000] - How long to wait for reactions
         * @returns {Promise<boolean>}
         */
        public async paginate(listenTo: Snowflake, back: boolean, next: boolean, timeout = 30000) {
            // If we only have the 'forward' reaction, we want to remove it and put the 'back' in first
            if (back && !this.reactions.has("⬅")) {
                if (this.reactions.has("➡")) { await this.reactions.remove("➡")!; }
                await this.react("⬅");
            }
            if (!back && this.reactions.has("⬅")) { await this.reactions.remove("⬅"); }
            if (next && !this.reactions.has("➡")) { await this.react("➡"); }
            if (!next && this.reactions.has("➡")) { await this.reactions.remove("➡"); }

            const filter = ({ emoji }: MessageReaction, u: User) =>
                ["⬅", "➡"].includes(emoji.name) && u.id === listenTo;

            try {
                const response = await this.awaitReactions(filter, {
                    max: 1,
                    time: timeout
                });

                // Reset the selection
                await response.first()!.users.remove(listenTo);
                return response.first()!.emoji.name === "➡" ? true : false;
            } catch (e) {
                this.reactions.removeAll();
                return false;
            }
        }
    }

    return KauriMessage;
});
