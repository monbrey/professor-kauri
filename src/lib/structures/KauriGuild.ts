import { Structures } from "discord.js";
import { connection } from "mongoose";
import KauriClient from "../../client/KauriClient";
import { IStarboardConfigDocument } from "../../models/schemas/starboardConfig";

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
