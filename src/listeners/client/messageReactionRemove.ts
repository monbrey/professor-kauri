import { Listener } from "discord-akairo";
import { Collection, Message, MessageEmbed, MessageReaction, Snowflake, TextChannel, User } from "discord.js";

const getImage = (message: Message) => {
    const imgRe = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png|webp)/gi;
    if (message.attachments.size > 0) {
        if (imgRe.test(message.attachments.array()[0].url)) {
            return message.attachments.array()[0].url;
        }
    }
    if (message.embeds.length > 0) {
        if (message.embeds[0].type === "image" && imgRe.test(message.embeds[0].url)) {
            return message.embeds[0].url;
        }
    }

    return null;
};

export default class MessageReactionRemoveListener extends Listener {
    private messageCache = new Collection<Snowflake, number>();

    constructor() {
        super("messageReactionRemove", {
            emitter: "client",
            event: "messageReactionRemove"
        });

        this.messageCache = new Collection<Snowflake, number>();

    }

    public async exec(reaction: MessageReaction, user: User) {
        const { message, emoji, users, count } = reaction;

        // Ignore messages that arent in a guild
        if (!message.guild) { return; }

        // Fetch partial messages
        if (message.partial) {
            await message.fetch();
            await users.fetch();
        }

        // Fetch the starboard settings
        const starboard = this.client.settings!.get(message.guild.id, "starboard");

        // Check that the starChannel is set
        if (!starboard || !starboard.channel) { return; }

        // Assign the starboard data
        const starChannel = message.guild.channels.get(starboard.channel);
        if (!(starChannel instanceof TextChannel)) { return; }
        const starEmoji = starboard.emoji || "⭐";
        const minReacts = starboard.minReacts || 1;

        // And check it still exists
        if (!starChannel) { return; }

        // And that you're not trying to star a message in the starboard
        if (message.channel.id === starChannel.id) { return; }

        // Ignore the author
        if (message.author && message.author.id === user.id) { return; }

        // Check for the star emoji
        if (emoji.toString() !== starEmoji) { return; }

        const stars = users.has(message.author.id) ? count - 1 : count;

        // If we've passed ALL the checks, we can add this to the queue
        this.client.reactionQueue.add(async () => {
            // Get the messages from the channel
            const fetch = await starChannel.messages.fetch({ limit: 100 });

            // Check if it was previously starred
            const previous = fetch.find(({ embeds: [e] }: Message) => {
                if (!e || !e.footer || !e.footer.text) { return false; }
                return e.footer.text.startsWith("⭐") && e.footer.text.endsWith(message.id);
            });

            if (previous) {
                const starMsg = await starChannel.messages.fetch(previous.id);
                if (stars < minReacts) {
                    return starMsg.delete();
                }

                const image = message.attachments.size > 0 ? getImage(message) : "";
                const embed = new MessageEmbed()
                    .setColor(previous.embeds[0].color)
                    .setDescription(previous.embeds[0].description)
                    .setAuthor(message.author!.tag, message.author!.displayAvatarURL())
                    .setTimestamp()
                    .addField(`Votes ${starEmoji}`, stars, true)
                    .addField("Link", `[Jump to message](${message.url})`, true)
                    .setFooter(`⭐ | ${message.id}`)
                    .setImage(image || "");

                return starMsg.edit({ embed });
            }
        });

        return this.client.logger.messageReactionRemove(reaction, user);
    }
}
