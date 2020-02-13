import { GuildMember, Message } from "discord.js";
import { Pokemon } from "urpg.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { Roles } from "../../../util/constants";
import { MessageEmbed } from "discord.js";
import { stripIndents } from "common-tags";

interface CommandArgs {
    pokemon: Pokemon;
    now: boolean;
}

interface Auction {
    auctioneer: GuildMember;
    member?: GuildMember;
    value: number;
}

const auctionUpdate = (pokemon: Pokemon, bid: Auction) => `**Auction**: ${pokemon.name}
**Current Bid**: ${bid.member ? bid.member.displayName : "Starting"} at ${bid.value.to$()}`;

export default class AuctionCommand extends KauriCommand {
    constructor() {
        super("Auction", {
            aliases: ["auction"],
            category: "Game",
            channel: "guild",
            defaults: { disabled: true },
            description: "Auctions off a Pokemon to the highest bidder",
            flags: ["-now"],
            usage: "auction <Pokemon>",
            userRoles: [Roles.Staff, Roles.EventCoordinator]
        });
    }

    public *args(message: Message) {
        const pokemon = yield {
            type: "api-pokemon"
        };

        const now = yield {
            match: "flag",
            flag: ["-now"]
        };

        return pokemon ? { pokemon: pokemon.value, now } : { now };
    }

    public async exec(message: Message, { pokemon, now }: CommandArgs) {
        if (!pokemon) return;

        const sent = await message.channel.send(`Start an auction for **${pokemon.name}** at **$1,000**?`);
        const confirm = await sent.reactConfirm(message.author.id);

        if (!confirm) {
            sent.delete();
            return;
        }

        if (!now) {
            message.channel.send(`<@${Roles.Auction}>: Auction for ${pokemon.name} starting in 5 minutes!`);
            if (!now) setTimeout(() => message.channel.send(`<@${Roles.Auction}>: Auction for ${pokemon.name} starting in 1 minute!`), 240000);

            await new Promise(resolve => setTimeout(() => resolve(true), 10000));
        }

        const bid: Auction = {
            auctioneer: message.member!,
            value: 1000
        };

        message.channel.send(auctionUpdate(pokemon, bid));

        const filter = (m: Message) => {
            if (m.member?.id === bid.auctioneer.id) return false;
            if (m.member?.id === bid.member?.id) return false;

            const strVal = m.content.replace(/[$,]/g, "");
            const value = strVal.endsWith("k") ? parseInt(strVal.slice(0, -1), 10) * 1000 : parseInt(strVal, 10);

            if (isNaN(value)) return false;
            if (value < bid.value) return false;

            return true;
        };

        const collector = message.channel.createMessageCollector(filter, { idle: 60000 });
        const w1 = setTimeout(() => message.channel.send(`${bid.member ? bid.member.displayName : "Starting"} at ${bid.value.to$()} - going once!`), 20000, bid);
        const w2 = setTimeout(() => message.channel.send(`${bid.member ? bid.member.displayName : "Starting"} at ${bid.value.to$()} - going twice!`), 40000, bid);

        collector.on("collect", (m: Message) => {
            const strVal = m.content.replace(/[$,]/g, "");
            const value = strVal.endsWith("k") ? parseInt(strVal.slice(0, -1), 10) * 1000 : parseInt(strVal, 10);


            if (value && value > bid.value) {
                bid.member = m.member!;
                bid.value = value;

                message.channel.send(auctionUpdate(pokemon, bid));

                w1.refresh();
                w2.refresh();
            }
        });

        collector.on("end", () => {
            if (!bid.member)
                return message.channel.send("No bids received! Auction complete.");

            const embed = new MessageEmbed()
                .setTitle("Auction Complete!")
                .setDescription(stripIndents`${pokemon.name} sold to ${bid.member.displayName} for ${bid.value.to$()}.
                Head over to the [Auction Room](https://forum.pokemonurpg.com/showthread.php?tid=1719) to claim!. Include the link to this message:`);

            return message.channel.send(embed).then(m => {
                embed.description += `\n${m.url}`;
                m.edit(embed);
            });
        });
    }
}
