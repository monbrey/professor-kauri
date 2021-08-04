// import { Guild, Structures } from 'discord.js';
// import { ITrainer, Trainer } from '../../models/mongo/trainer';
// import { KauriClient } from '../KauriClient';

// declare module 'discord.js' {
//   interface GuildMember {
//     trainer: ITrainer;
//   }
// }

// Structures.extend('GuildMember', GuildMember => {
//   class GuildTrainer extends GuildMember {
//     public trainer: ITrainer = new Trainer();

//     constructor(client: KauriClient, data: any, guild: Guild) {
//       super(client, data, guild);

//       this.resolveTrainer();
//     }

//     private async resolveTrainer(): Promise<void> {
//       this.trainer = (await Trainer.findOne({ _id: this.id })) || (await Trainer.create({ _id: this.id }));
//     }
//   }

//   return GuildTrainer;
// });
