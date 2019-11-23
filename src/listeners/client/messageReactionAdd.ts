import { Listener } from "discord-akairo";
import {
    Collection, Message, MessageEmbed, MessageReaction, Snowflake, TextChannel, User
} from "discord.js";

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

export default class MessageReactionAddListener extends Listener {
    private messageCache: Collection<Snowflake, number>;

    constructor() {
        super("messageReactionAdd", {
            emitter: "client",
            event: "messageReactionAdd"
        });

        this.messageCache = new Collection<Snowflake, number>();
    }

    public async exec(reaction: MessageReaction, user: User) {
        // Fetch partial messages
        if (reaction.message.partial) {
            await reaction.message.fetch();
            await reaction.users.fetch();
        }

        const { message, emoji, users, count } = reaction;


        // Ignore messages that arent in a guild
        if (!message.guild) { return; }

        // Fetch the starboard settings
        const starboard = this.client.settings!.get(message.guild.id, "starboard");

        // Check that the starChannel is set
        if (!starboard || !starboard.channel) { return; }

        // Assign the starboard data
        const starChannel = message.guild.channels.get(starboard.channel);
        if (!(starChannel instanceof TextChannel)) { return; }
        const starEmoji = starboard.emoji || "⭐";
        const minReacts = starboard.minReacts || 1;

        // If this isnt a starboard reaction, we dont need to process it here
        if (emoji.toString() !== starEmoji) { return; }

        // Clear out any messages which were cached over a minute ago
        this.messageCache = this.messageCache.filter(m => m < Date.now() - 60000);

        // If the message is still in the cache, we don't want to output errors
        const hideErrors = this.messageCache.has(message.id);

        // Cache the message ID with the current timestamp
        // This is a rolling 60 seconds to prevent spam
        this.messageCache.set(message.id, Date.now());

        // Check that the starboard still exists
        if (!starChannel) {
            return hideErrors
                ? null
                : message.channel.send("The configured Starboard channel could not be found.");
        }

        // And that you're not trying to star a message in the starboard
        if (message.channel.id === starChannel.id) { return; }

        // Check they arent a narcissist
        if (message.author && message.author.id === user.id) {
            return hideErrors
                ? null
                : message.channel.send(`You cannot ${starEmoji} your own messages`);
        }

        const stars = users.has(message.author.id) ? count - 1 : count;

        // Check that the minimum number of reactions has been reached
        if (stars < minReacts) { return; }

        // If we've passed ALL the checks, we can add this to the queue
        this.client.reactionQueue.add(async () => {
            // Get the messages from the channel
            const fetch = await starChannel.messages.fetch({
                limit: 100
            });
            // Check if it was previously starred
            const previous = fetch.find(
                ({ embeds: [e] }: Message) => {
                    if (!e || !e.footer || !e.footer.text) { return false; }
                    return e.footer.text.startsWith("⭐") && e.footer.text.endsWith(message.id);
                }
            );

            // We use the this.extension function to see if there is anything attached to the message.
            const image = getImage(message);
            // If the message is empty, we don't allow the user to star the message.
            if (image === null && message.cleanContent.length < 1 && message.embeds.length < 1) {
                return message.channel.send("You cannot star an empty message.");
            }

            const embed = new MessageEmbed()
                .setColor(previous ? previous.embeds[0].color : 15844367)
                .setAuthor(message.author!.tag, message.author!.displayAvatarURL())
                .setTimestamp()
                .addField(`Votes ${starEmoji}`, stars, true)
                .addField("Link", `[Jump to message](${message.url})`, true)
                .setFooter(`⭐ | ${message.id}`)
                .setImage(image || "");

            if (previous && previous.embeds[0].description) {
                embed.setDescription(previous.embeds[0].description);
            } else if (message.cleanContent) { embed.setDescription(message.cleanContent); }

            if (previous) {
                // We fetch the ID of the message already on the starboard.
                const starMsg = await starChannel.messages.fetch(previous.id);
                // And now we edit the message with the new embed!
                return await starMsg.edit({
                    embed
                });
            } else { return await starChannel.send(embed); }
        },
        { priority: 1 }
        );

        return this.client.logger.messageReactionAdd(reaction, user);
    }
}
