import { Guild } from "discord.js";
import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "guildCreate",
	emitter: "client",
};

export default class GuildCreateEvent extends Event {
	public exec(guild: Guild): Awaited<void> {
		console.log(`Joined ${guild.name} (${guild.id})`);
	}
}
