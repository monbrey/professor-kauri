import { Event, EventData } from "@professor-kauri/framework";

export const data: EventData = {
	name: "ready",
	emitter: "client",
};

export default class ReadyEvent extends Event {
	public async exec(): Promise<void> {
		const args = process.argv.slice(2);
		if (args.includes("--deploy")) {
			await this.client.commands.deploy();
			console.log("Commands deployed");
		}

		await this.client.commands.fetch();
		console.log("Ready");
	}
}
