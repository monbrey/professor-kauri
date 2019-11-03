import { Guild, Structures } from "discord.js";
import KauriClient from "../../client/KauriClient";
import { ITrainer, Trainer } from "../../models/trainer";
import MongooseProvider from "../../providers/MongooseProvider";

const Trainers = new MongooseProvider(Trainer, "_id");

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
            this.trainer = await Trainers.fetch(this.id) || await Trainers.add(new Trainer({ _id: this.id }));
        }
    }

    return GuildTrainer;
});
