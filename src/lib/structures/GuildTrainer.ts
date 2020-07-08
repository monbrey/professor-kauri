import { Guild, Structures } from "discord.js";
import KauriClient from "../../client/KauriClient";
import { ITrainer, Trainer } from "../../models/trainer";

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
            this.trainer = await Trainer.findOne({ _id: this.id }) || await Trainer.create<Omit<ITrainer, "cash" | "battleRecord" | "stats" | "migrated">>({ _id: this.id });
        }
    }

    return GuildTrainer;
});
