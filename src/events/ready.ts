import { EventData, Event } from "../framework/structures/events/Event";

export const data: EventData = {
	name: "ready",
	emitter: "client",
};

export default class ReadyEvent extends Event {
	public async exec(): Promise<void> {
		const args = process.argv.slice(2);
		if (args.includes("--deploy")) {
			await this.client.commands.deploy();
			this.client.logger.info({ event: "ready", message: "Commands deployed" });
			process.exit();
		}

		await this.client.commands.fetch();
		this.client.logger.info({ event: "ready", message: "Client ready" });
	}
}
