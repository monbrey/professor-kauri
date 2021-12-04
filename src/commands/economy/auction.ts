import { stripIndents } from "common-tags";
import { CommandInteraction, GuildMember, Message, MessageEmbed } from "discord.js";
import { MessageButtonStyles, MessageComponentTypes } from "discord.js/typings/enums";
import { DateTime } from "luxon";
import { Constants } from "../../framework";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes, CommandOptionTypes } from "../../typings";

interface Auction {
	auctioneer: GuildMember;
	member?: GuildMember;
	value: number;
}

export const data = {
	name: "auction",
	description: "Auction off a Pokemon",
	options: [{
		name: "species",
		description: "Species of Pokemon to be auctioned for",
		type: CommandOptionTypes.String,
		augmentTo: AugmentationTypes.Pokemon,
		required: true,
		autocomplete: true,
	}, {
		name: "holding",
		description: "Item the Pokemon is holding",
		type: CommandOptionTypes.String,
		augmentTo: AugmentationTypes.Item,
		autocomplete: true,
	}],
} as const;

export default class AuctionCommand extends Command {
	private pokemonList?: string[];
	private pokemonListLastFetched?: DateTime;
	private itemList?: string[];
	private itemListLastFetched?: DateTime;

	private auctionUpdate(name: string, bid: Auction) {
		const value = bid.value.toLocaleString("en-US", { style: "currency", currency: "USD" });
		return `**Auction**: ${name}
		**Current Bid**: ${bid.member ? bid.member.displayName : "Starting"} at ${value}`;
	}

	// public async autocomplete(
	// 	interaction: AutocompleteInteraction<"cached">,
	// 	arg: CommandInteractionOption
	// ): Promise<void> {
	// 	let choices: Array<{ name: string; value: string }> = [];
	// 	switch (option.name) {
	// 		case "species": {
	// 			if (
	// 				!this.pokemonList ||
	// 				!this.pokemonListLastFetched ||
	// 				this.pokemonListLastFetched < DateTime.now().minus({ days: 1 })
	// 			) {
	// 				this.pokemonList = await this.client.urpg.species.list();
	// 				this.pokemonListLastFetched = DateTime.now();
	// 			}
	// 			const { ratings } = findBestMatch(option.value, this.pokemonList);
	// 			choices = ratings
	// 				.sort((a, b) => b.rating - a.rating).slice(0, 10)
	// 				.map(l => ({ name: l.target, value: l.target }));
	// 			break;
	// 		}
	// 		case "holding": {
	// 			if (
	// 				!this.itemList ||
	// 				!this.itemListLastFetched ||
	// 				this.itemListLastFetched < DateTime.now().minus({ days: 1 })
	// 			) {
	// 				this.itemList = await this.client.urpg.item.list();
	// 				this.itemListLastFetched = DateTime.now();
	// 			}
	// 			const { ratings } = findBestMatch(option.value, this.itemList);
	// 			choices = ratings
	// 				.sort((a, b) => b.rating - a.rating).slice(0, 10)
	// 				.map(l => ({ name: l.target, value: l.target }));
	// 			break;
	// 		}
	// 	}

	// 	// @ts-expect-error API is privately typed
	// 	await this.client.api.interactions(interaction.id, interaction.token).callback.post({
	// 		data: {
	// 			type: 8,
	// 			data: {
	// 				choices,
	// 			},
	// 		},
	// 	});
	// }

	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		if (!interaction.inCachedGuild() || interaction.channel === null) return;
		const name = args.species.name;

		const sent = await interaction.reply({
			content: `Start an auction for **${name}** at **$1,000**?`,
			components: [
				{
					type: MessageComponentTypes.ACTION_ROW,
					components: [
						{
							type: MessageComponentTypes.BUTTON,
							customId: `start-${interaction.id}`,
							label: "Confirm",
							style: MessageButtonStyles.PRIMARY,
						},
					],
				},
			],
			ephemeral: true,
			fetchReply: true,
		});

		try {
			await sent.awaitMessageComponent({ time: 30000 });
		} catch (e) {
			interaction.editReply({ content: `Auction timed out`, components: [] });
			return;
		}

		const auctionRole = interaction.guild.roles.cache.get(Constants.Role.Auction);
		await interaction.followUp(`${auctionRole}: Auction for ${name} starting!`);

		const bid: Auction = {
			auctioneer: interaction.member,
			value: 1000,
		};

		await interaction.followUp(this.auctionUpdate(name, bid));

		const filter = (m: Message) => {
			// If (m.member?.id === bid.auctioneer.id) return false;
			// if (m.member?.id === bid.member?.id) return false;

			const strVal = m.content.toLowerCase().replace(/[$,]/g, "");

			if (!/[0-9.]+k?/.test(strVal)) return false;
			const value = strVal.endsWith("k") ? Math.floor(parseFloat(strVal.slice(0, -1)) * 1000) : parseInt(strVal, 10);

			if (isNaN(value)) return false;
			if (value < bid.value) return false;

			return true;
		};

		const collector = interaction.channel.createMessageCollector({ filter, idle: 60000 });
		const w1 = setTimeout(
			(n, b) =>
				interaction.followUp(`${this.auctionUpdate(n, b)}\nGoing once!`),
			20000,
			name,
			bid,
		);

		const w2 = setTimeout(
			(n, b) =>
				interaction.followUp(`${this.auctionUpdate(n, b)}\nGoing twice!`),
			40000,
			name,
			bid,
		);

		collector.on("collect", (m: Message) => {
			if (!m.guild || !m.member) return;

			const strVal = m.content.toLowerCase().replace(/[$,]/g, "");
			const value = strVal.endsWith("k") ? Math.floor(parseFloat(strVal.slice(0, -1)) * 1000) : parseInt(strVal, 10);

			if (value && value > bid.value) {
				bid.member = m.member;
				bid.value = value;

				interaction.followUp(this.auctionUpdate(name, bid));

				w1.refresh();
				w2.refresh();
			}
		});

		collector.on("end", () => {
			if (!bid.member) {
				interaction.followUp("No bids received! Auction complete.");
				return;
			}

			const value = bid.value.toLocaleString("en-US", { style: "currency", currency: "USD" });

			const embed = new MessageEmbed()
				.setTitle("Auction Complete!")
				.setDescription(
					stripIndents`${name} sold to ${bid.member.displayName} for ${value}.
					Head over to the [Auction Room](https://forum.pokemonurpg.com/showthread.php?tid=1719) to claim!
					Include the link to this message:`,
				);

			interaction.followUp({ embeds: [embed] });
		});
	}
}

