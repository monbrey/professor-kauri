// import { stripIndents } from 'common-tags';
// import { GuildMember, Message, MessageEmbed } from 'discord.js';
// import emoji from 'node-emoji';
// import { KauriCommand } from '../../../lib/commands/KauriCommand';
// import { ITrainerDocument, Trainer } from '../../../models/mongo/trainer';

// module.exports = class LadderCommand extends KauriCommand {
//   constructor() {
//     super('ELO Ladder', {
//       aliases: ['ladder'],
//       category: 'Game',
//       channel: 'guild',
//       clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
//       description: 'View the ELO rankings',
//       requiresDatabase: true,
//       usage: 'ladder',
//     });
//   }

//   public async exec(message: Message): Promise<Message | undefined> {
//     const data: ITrainerDocument[] = await Trainer.find({ 'battleRecord.elo': { $not: { $eq: null } } })
//       .select('_id battleRecord.elo')
//       .sort({ 'battleRecord.elo': -1 });

//     if (data.length === 0) {
//       return message.util?.send({
//         embeds: [
//           new MessageEmbed()
//             .setTitle('Nobody has joined this ladder yet')
//             .setDescription('Partipate in ladder battles to raise your ranking!')
//         ]
//       });
//     }

//     const validMembers: GuildMember[] = data
//       .map(d => message.guild?.members.fetch(d.id))
//       .filter(d => typeof d !== 'undefined');
//     const elos = validMembers.map(m => `${emoji.strip(m.displayName).padEnd(30, ' ')} | ${m.trainer.battleRecord.elo}`);

//     const ladder = stripIndents`**URPG ELO Ladder\`\`\`${'Battler'.padEnd(30, ' ')} | ELO\`\`\`**\`\`\`${elos.join(
//       '\n',
//     )}\`\`\``;

//     return message.util!.send(ladder);
//   }
// };
