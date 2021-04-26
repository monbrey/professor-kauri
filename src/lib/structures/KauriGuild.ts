import { Structures } from "discord.js";
import { IStarboardConfigDocument } from "../../models/schemas/starboardConfig";
import { KauriClient } from "../KauriClient";

declare module "discord.js" {
  interface Guild {
    client: KauriClient;
    starboard?: IStarboardConfigDocument;
    logChannel?: Snowflake;
  }
}

Structures.extend("Guild", Guild => {
  class KauriGuild extends Guild {
    constructor(client: KauriClient, data: any) {
      super(client, data);
    }

    public get starboard() {
      return this.client.settings?.get(this.id)?.starboard;
    }

    public get logChannel() {
      return this.client.settings?.get(this.id)?.logs;
    }
  }

  return KauriGuild;
});
