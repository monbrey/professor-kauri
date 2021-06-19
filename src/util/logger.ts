import {
  Guild,
  GuildAuditLogsEntry,
  GuildChannel,
  GuildMember,
  Message,
  MessageEmbed,
  MessageReaction,
  Snowflake,
  TextChannel,
  User,
  Util,
} from 'discord.js';
import { createLogger, format, Logger, transports } from 'winston';
import { KauriClient } from '../lib/KauriClient';
import { KauriCommand } from '../lib/commands/KauriCommand';

const logFormat = format.combine(
  format(info => (info.level !== 'error' ? info : false))(),
  format.label({ label: process.env.NODE_ENV }),
  format.timestamp(),
  format.json(),
  format.printf((info: any) => {
    const message = info instanceof Object ? JSON.stringify(info) : info.message;
    return `[${info.timestamp}] ${message}`;
  }),
);

const errorFormat = format.combine(
  format.label({ label: process.env.NODE_ENV }),
  format.timestamp(),
  format.json(),
  format.printf(info => `[${info.timestamp}] ${info.level}: ${info.stack || info.message}`),
);

const consoleLogFormat = format.combine(
  format(info => (info.level !== 'error' ? info : false))(),
  format.label({ label: process.env.NODE_ENV }),
  format.timestamp(),
  format.colorize(),
  format.json(),
  format.printf(info => {
    const message = (info.message as any) instanceof Object ? JSON.stringify(info.message) : info.message;
    return `[${info.timestamp}] ${info.level}: ${message}`;
  }),
);

const consoleErrorFormat = format.combine(
  format.label({ label: process.env.NODE_ENV }),
  format.timestamp(),
  format.colorize(),
  format.json(),
  format.printf(info => `[${info.timestamp}]: ${info.stack || info.message}`),
);

const outs: any[] = [
  new transports.Console({
    format: consoleLogFormat,
    level: 'debug',
  }),
  new transports.Console({
    format: consoleErrorFormat,
    level: 'error',
  }),
];

if (process.env.NODE_ENV === 'development') {
  outs.push(
    new transports.File({
      format: logFormat,
      filename: './logs/professor-kauri.log',
    }),
    new transports.File({
      format: errorFormat,
      filename: './logs/professor-kauri-error.log',
      level: 'error',
    }),
  );
}

interface Location {
  server?: {
    id: Snowflake;
    name: string;
  };
  channel: {
    id: Snowflake;
    name: string;
  };
}

class CustomLogger {
  private client: KauriClient;
  private winston: Logger;

  constructor(client: KauriClient) {
    this.winston = createLogger({
      level: 'info',
      transports: outs,
    });

    this.client = client;
  }

  private getLogChannel(guild: Guild | null): TextChannel | undefined {
    let logChannel;
    if (guild) {
      const logChannelID = this.client.settings?.get(guild.id)?.logs;
      if (logChannelID) {
        const tryLogChannel = guild.channels.cache.get(logChannelID);
        if (tryLogChannel instanceof TextChannel) {
          logChannel = tryLogChannel;
        }
      }
    }
    return logChannel;
  }

  public parseError(error: Error): void {
    const errorType = error.constructor.name;
    error = { ...Util.makePlainError(error) };

    if (errorType === 'DiscordAPIError') {
      Error.captureStackTrace(error);
      error.stack = `${errorType}: ${error.message}\n${error.stack?.split('\n').slice(2, -1).join('\n')}`;
    }

    this.winston.error(Object.assign({ ...error }, { stack: error.stack }));
  }

  // #region PASSTHROUGH
  public info(data: any): void {
    this.winston.info(data);
  }

  public debug(data: any): void {
    this.winston.debug(data);
  }

  public warn(data: any): void {
    this.winston.warn(data);
  }

  public error(data: any): void {
    this.winston.error(data);
  }

  public location(input: Message): Location {
    if (!input.guild) {
      return { channel: { id: input.channel.id, name: `${input.author.username} (DM)` } };
    }

    return {
      server: { id: input.guild.id, name: input.guild.name },
      channel: { id: input.channel.id, name: (input.channel as GuildChannel).name },
    };
  }
  // #endregion

  // #region GENERIC DISCORD LOGGERS
  public async dlog(guild: Guild, title: string, description: string): Promise<void> {
    const embed = new MessageEmbed({ title, description, color: 0xfefefe }).setTimestamp();
    await this.getLogChannel(guild)?.send({ embeds: [embed] });
  }

  public async minor(guild: Guild, title: string, description: string): Promise<void> {
    const embed = new MessageEmbed({ title, description, color: 0xffc107 }).setTimestamp();
    await this.getLogChannel(guild)?.send({ embeds: [embed] });
  }

  public async major(guild: Guild, title: string, description: string): Promise<void> {
    const embed = new MessageEmbed({ title, description, color: 0xe50000 }).setTimestamp();
    await this.getLogChannel(guild)?.send({ embeds: [embed] });
  }

  // #region EVENTS
  public async guildMemberAdd(member: GuildMember): Promise<void> {
    this.winston.info({
      message: 'New member joined',
      member: member.id,
      server: { name: member.guild.name, id: member.guild.id },
      key: 'guildMemberAdd',
    });

    const embed = new MessageEmbed()
      .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
      .setFooter('New member joined')
      .setTimestamp();

    await this.getLogChannel(member.guild)?.send({ embeds: [embed] });
  }

  public async guildMemberRemove(member: GuildMember, auditLog?: GuildAuditLogsEntry): Promise<void> {
    const embed = new MessageEmbed().setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL());

    if (!auditLog) {
      this.winston.info({
        message: 'Member left',
        member: member.id,
        server: { name: member.guild.name, id: member.guild.id },
        key: 'guildMemberRemove',
      });

      embed.setFooter('Member left').setTimestamp();
    } else {
      const action = auditLog.action === 'MEMBER_BAN_ADD' ? 'Ban' : 'Kick';
      this.winston.info({
        message: 'Member removed',
        member: member.id,
        executor: auditLog.executor?.id,
        action,
        reason: auditLog.reason ? auditLog.reason : 'No reason provided',
        server: { name: member.guild.name, id: member.guild.id },
        key: 'guildMemberRemove',
      });

      embed
        .setDescription(
          `${action} by ${auditLog.executor}: ${auditLog.reason ? auditLog.reason : 'No reason provided'}`,
        )
        .setFooter(`Member removed (${action})`);
    }

    await this.getLogChannel(member.guild)?.send({ embeds: [embed] });
  }

  public guildMemberUpdate(oldMember: GuildMember, newMember: GuildMember): void {
    this.winston.info({
      message: 'Member updated',
      member: newMember.id,
      server: { name: newMember.guild.name, id: newMember.guild.id },
      key: 'guildMemberUpdate',
    });
  }

  public message(message: Message): void {
    this.winston.info({
      message: 'Message processed',
      content: message.content,
      author: message.author?.id,
      ...this.location(message),
      key: 'message',
    });
  }

  public async migrate(message: Message, cash: number, cc: number): Promise<void> {
    this.winston.info({
      message: 'Wallet migrated',
      member: message.author?.id,
      values: { cash, cc },
      ...this.location(message),
      key: 'migrate',
    });

    const embed = new MessageEmbed()
      .setAuthor(`${message.author?.tag} (${message.author?.id})`, message.author?.displayAvatarURL())
      .setFooter('Wallet Migrated')
      .addFields([
        { name: '**Cash**', value: `$${cash.toLocaleString()}`, inline: true },
        { name: '**Contest Credit**', value: `${cc.toLocaleString()} CC`, inline: true },
      ])
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  // Public async messageDelete(message: Message) { }

  public messageReactionAdd(reaction: MessageReaction, user: User): void {
    this.winston.info({
      message: 'Message reaction added',
      target: reaction.message.id,
      ...this.location(reaction.message as Message),
      reactor: user.id,
      count: reaction.count,
      key: 'messageReactionAdd',
    });
  }

  public messageReactionRemove(reaction: MessageReaction, user: User): void {
    this.winston.info({
      message: 'Message reaction removed',
      target: reaction.message.id,
      ...this.location(reaction.message as Message),
      reactor: user.id,
      count: reaction.count,
      key: 'messageReactionRemove',
    });
  }

  public raw(data: any): void {
    this.winston.info({
      message: 'Raw event processed',
      name: data.t,
      key: 'raw',
    });
  }

  public ready(): void {
    this.winston.info({
      message: 'Client ready',
      key: 'ready',
    });
  }

  // #endregion

  // #region COMMANDS
  public ability(message: Message, query: string, result: string): void {
    this.winston.info({
      message: 'Abilities searched',
      query,
      result,
      ...this.location(message),
      key: 'ability',
    });
  }
  public async deduct(message: Message, log: Message): Promise<void> {
    this.winston.info({
      message: 'Deduction logged',
      author: message.author?.id,
      ...this.location(message),
      log: log.url,
      key: 'deduct',
    });

    const embed = new MessageEmbed()
      .setFooter('deduct')
      .setDescription(
        `${message.member?.displayName} made a deduction in [${(log.channel as GuildChannel).name}](${log.url})`,
      )
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public dice(message: Message, response: string, result: string): void {
    this.winston.info({
      message: 'Dice rolled',
      result,
      ...this.location(message),
      verification: response,
    });
  }

  public async elo(message: Message, winner: GuildMember, loser: GuildMember): Promise<void> {
    this.winston.info({
      message: 'ELO updated',
      winner: winner.id,
      loser: loser.id,
      referee: message.author,
      ...this.location(message),
      key: 'elo',
    });

    const embed = new MessageEmbed()
      .setFooter('elo')
      .setColor(0x1f8b4c)
      .setDescription(`${message.member} updated the ELOs of ${winner} and ${loser}`)
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public item(message: Message, query: string, result: string): void {
    this.winston.info({
      message: 'Items searched',
      query,
      result,
      ...this.location(message),
      key: 'item',
    });
  }

  public async judgelog(message: Message, log: Message): Promise<void> {
    this.winston.info({
      message: 'Contest logged',
      author: message.author?.id,
      ...this.location(message),
      log: log.url,
      key: 'judgelog',
    });

    const embed = new MessageEmbed()
      .setFooter('judgelog')
      .setColor(0x9b59b6)
      .setDescription(
        `${message.member?.displayName} logged a contest in [${(log.channel as GuildChannel).name}](${log.url})`,
      )
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public async logs(message: Message, target: GuildChannel): Promise<void> {
    this.winston.info({
      message: 'Log channel set',
      ...this.location(message),
      target: { id: target.id, name: target.name },
      executor: message.author?.id,
      key: 'logs',
    });

    const embed = new MessageEmbed()
      .setFooter('logs')
      .setDescription(`${message.member?.displayName} set the logging channel to ${target}`)
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public move(message: Message, query: string, result: string): void {
    this.winston.info({
      message: 'Moves searched',
      query,
      result,
      ...this.location(message),
      key: 'move',
    });
  }

  public async pay(message: Message, log: Message): Promise<void> {
    this.winston.info({
      message: 'Payment logged',
      author: message.author?.id,
      ...this.location(message),
      log: log.url,
      key: 'pay',
    });

    const embed = new MessageEmbed()
      .setFooter('pay')
      .setDescription(
        `${message.member?.displayName} made a payment in [${(log.channel as GuildChannel).name}](${log.url})`,
      )
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public async purge(message: Message, numDeleted: number | string): Promise<void> {
    this.winston.info({
      message: 'Messages pruned',
      ...this.location(message),
      deleted: numDeleted,
      key: 'prune',
    });

    const embed = new MessageEmbed()
      .setFooter('prune')
      .setDescription(
        `${message.member?.displayName} deleted ${numDeleted} messages from ${(message.channel as GuildChannel).name}`,
      )
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public reload(message: Message, command: KauriCommand): void {
    this.winston.info({
      message: `${command.constructor.name} reloaded`,
      ...this.location(message),
      key: 'reload',
    });
  }

  public async reflog(message: Message, log: Message): Promise<void> {
    this.winston.info({
      message: 'Battle logged',
      author: message.author?.id,
      ...this.location(message),
      log: log.url,
      key: 'reflog',
    });

    const embed = new MessageEmbed()
      .setFooter('Battle')
      .setColor(0x1f8b4c)
      .setDescription(
        `${message.member?.displayName} logged a battle in [**#${(log.channel as GuildChannel).name}**](${log.url})`,
      )
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public rank(message: Message, query: string, result: string | number): void {
    this.winston.info({
      message: 'Ranks searched',
      query,
      result: typeof result === 'string' ? result : `${result} results`,
      ...this.location(message),
      key: 'rank',
    });
  }

  public async starboard(message: Message, target: GuildChannel | string, param = null): Promise<void> {
    this.winston.info({
      message: 'Starboard config updated',
      config: param ? param : 'channel',
      param: param ? target : (target as GuildChannel).id,
      ...this.location(message),
      key: 'starboard',
    });

    const embed = new MessageEmbed()
      .setFooter('starboard')
      .setDescription(`${message.member?.displayName} set the starboard-${param ? param : 'channel'} to ${target}`)
      .setTimestamp();

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public async start(message: Message, trainer: User, starter: any): Promise<void> {
    this.winston.info({
      message: 'New trainer started',
      ...this.location(message),
      trainer: { id: trainer.id, username: trainer.username },
      starter: starter.uniqueName,
      key: 'start',
    });

    const embed = new MessageEmbed()
      .setFooter('start')
      .setTimestamp()
      .setDescription(
        `Trainer ${trainer.username} (${message.member} : ${message.member?.id}) started with ${starter.uniqueName}`,
      );

    await this.getLogChannel(message.guild)?.send({ embeds: [embed] });
  }

  public statusEffect(message: Message, query: string, result: string): void {
    this.winston.info({
      message: 'Status Effects searched',
      query,
      result,
      ...this.location(message),
      key: 'move',
    });
  }

  /*
    Async purchase(message, customer, log) {
        this.winston.info({
            "message": `${customer} made a Pokemart purchase`,
            "log": log.url,
            "key": "buy"
        })

        if (!message.guild.logChannel) return

        let embed = new RichEmbed()
            .setFooter("Pokemart purchase")
            .setTimestamp()
            .setDescription(`${customer} made a purchase in [${log.channel}](${log.url}`)

        return message.guild.logChannel{ embeds: [embed] }
    }

    async newStarter(message, trainer, starter) {
        this.winston.info(`New trainer ${trainer.username} (${trainer.id}) registered`, {
            key: "start"
        })

        if (!message.guild.logChannel) return

        let embed = new RichEmbed()
            .setFooter("New trainer")
            .setTimestamp()
            .setDescription(`New trainer ${trainer.username} (${message.member}) started with ${starter.uniqueName}`)

        return message.guild.logChannel.send({ embeds: [embed] })
    }

    /*
    async guildMemberAdd(member) {
        this.winston.info(`${member.user.tag} joined ${member.guild.name}`, {
            key: "guildMemberAdd"
        })

        if (!member.guild.logChannel) return

        let embed = new RichEmbed()
            .setAuthor(`${member.user.tag} (${member.id})`, member.user.avatarURL)
            .setFooter("User joined")
            .setTimestamp()

        return member.guild.logChannel.send({ embeds: [embed] })
    }

    async guildMemberRemove(member, auditLog) {
        let executor = auditLog ? auditLog.executor : member
        let executorTag = auditLog ? executor.tag : executor.user.tag

        let embed = new RichEmbed()
            .setAuthor(`${member.user.tag} (${member.id})`, member.user.avatarURL)
            .setTimestamp()

        if (auditLog) { // Was kicked
            this.winston.info(`${member.user.tag} was kicked from ${member.guild.name} by ${executorTag}`, {
                key: "guildMemberRemove"
            })

            embed.setDescription(`Kicked by ${executor}`).setFooter("User kicked")
        } else {
            this.winston.info(`${member.user.tag} left ${member.guild.name}`, {
                key: "guildMemberRemove"
            })
            embed.setFooter("User left")
        }

        if (member.guild.logChannel) return member.guild.logChannel.send({ embeds: [embed] })
    }*/
  // #endregion
}

export default CustomLogger;
