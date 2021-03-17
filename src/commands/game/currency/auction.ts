import { stripIndents } from "common-tags";
import { GuildMember, Message, MessageEmbed } from "discord.js";
import { Species } from "urpg.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { Roles } from "../../../util/constants";

interface TextCommandArgs {
  text: string;
  now: boolean;
  noResolve: true;
}

interface PokemonCommandArgs {
  pokemon: Species;
  now: boolean;
  noResolve: false;
}

interface Auction {
  auctioneer: GuildMember;
  member?: GuildMember;
  value: number;
}

const auctionUpdate = (name: string, bid: Auction) => `**Auction**: ${name}
**Current Bid**: ${bid.member ? bid.member.displayName : "Starting"} at ${bid.value.to$()}`;

export default class AuctionCommand extends KauriCommand {
  constructor() {
    super("Auction", {
      aliases: ["auction"],
      category: "Game",
      channel: "guild",
      defaults: { disabled: false },
      description: "Auctions off a Pokemon to the highest bidder",
      flags: ["-now", "-noresolve"],
      usage: "auction <Pokemon | String>",
      userRoles: [Roles.Staff, Roles.EventCoordinator]
    });
  }

  public *args(message: Message): any {
    const now = yield {
      match: "flag",
      flag: ["-now"]
    };

    const noResolve = yield {
      match: "flag",
      flag: ["-noresolve"]
    };

    if(noResolve) {
      const text = yield {
        type: "string",
        match: "rest"
      };

      return { now, noResolve, text };
    }

    const pokemon = yield {
      type: "pokemon"
    };

    return { pokemon: pokemon.value, now, noResolve };
  }

  public async exec(message: Message, args: PokemonCommandArgs | TextCommandArgs) {
    const name = args.noResolve ? args.text : args.pokemon.name;

    const sent = await message.channel.send(`Start an auction for **${name}** at **$1,000**?`);
    const confirm = await sent.reactConfirm(message.author.id);

    if (!confirm) {
      sent.delete();
      return;
    }

    if (!args.now) {
      const auctionRole = message.guild?.roles.cache.get(Roles.Auction);
      if (auctionRole) await auctionRole.setMentionable(true);
      await message.channel.send(`<@&${Roles.Auction}>: Auction for ${name} starting in 5 minutes!`);
      if (auctionRole) await auctionRole.setMentionable(false);

      if (!args.now) setTimeout(async () => {
        if (auctionRole) await auctionRole.setMentionable(true);
        await message.channel.send(`<@&${Roles.Auction}>: Auction for ${name} starting in 1 minute!`);
        if (auctionRole) await auctionRole.setMentionable(false);
      }, 240000);

      await new Promise(resolve => setTimeout(() => resolve(true), 300000));
    }

    const bid: Auction = {
      auctioneer: message.member!,
      value: 1000
    };

    message.channel.send(auctionUpdate(name, bid));

    const filter = (m: Message) => {
      // if (m.member?.id === bid.auctioneer.id) return false;
      // if (m.member?.id === bid.member?.id) return false;

      const strVal = m.content.toLowerCase().replace(/[$,]/g, "");

      if(!/[0-9.]+k?/.test(strVal)) return false;
      const value = strVal.endsWith("k") ? Math.floor(parseFloat(strVal.slice(0, -1)) * 1000) : parseInt(strVal, 10);

      if (isNaN(value)) return false;
      if (value < bid.value) return false;

      return true;
    };

    const collector = message.channel.createMessageCollector(filter, { idle: 60000 });
    const w1 = setTimeout(() => message.channel.send(`${bid.member ? bid.member.displayName : "Starting"} at ${bid.value.to$()} - going once!`), 20000, bid);
    const w2 = setTimeout(() => message.channel.send(`${bid.member ? bid.member.displayName : "Starting"} at ${bid.value.to$()} - going twice!`), 40000, bid);

    collector.on("collect", (m: Message) => {
      const strVal = m.content.toLowerCase().replace(/[$,]/g, "");
      const value = strVal.endsWith("k") ? Math.floor(parseFloat(strVal.slice(0, -1)) * 1000) : parseInt(strVal, 10);


      if (value && value > bid.value) {
        bid.member = m.member!;
        bid.value = value;

        message.channel.send(auctionUpdate(name, bid));

        w1.refresh();
        w2.refresh();
      }
    });

    collector.on("end", () => {
      if (!bid.member)
        return message.channel.send("No bids received! Auction complete.");

      const embed = new MessageEmbed()
        .setTitle("Auction Complete!")
        .setDescription(stripIndents`${name} sold to ${bid.member.displayName} for ${bid.value.to$()}.
                Head over to the [Auction Room](https://forum.pokemonurpg.com/showthread.php?tid=1719) to claim! Include the link to this message:`);

      return message.channel.send(embed).then(m => {
        embed.description += `\n${m.url}`;
        m.edit(embed);
      });
    });
  }
}
