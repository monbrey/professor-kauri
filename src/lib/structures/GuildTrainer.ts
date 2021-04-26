import { Guild, Structures } from "discord.js";
import { KauriClient } from "../KauriClient";
import { ITrainer, Trainer } from "../../models/mongo/trainer";

declare module "discord.js" {
  interface GuildMember {
    trainer: ITrainer;
  }
}

Structures.extend("GuildMember", GuildMember => {
  class GuildTrainer extends GuildMember {
    public trainer: ITrainer = new Trainer();

    constructor(client: KauriClient, data: any, guild: Guild) {
      super(client, data, guild);

      this.resolveTrainer();
    }

    private async resolveTrainer() {
      this.trainer = await Trainer.findOne({ _id: this.id }) || await Trainer.create({ _id: this.id });
    }
  }

  return GuildTrainer;
});
