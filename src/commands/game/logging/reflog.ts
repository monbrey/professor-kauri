import { stripIndents } from "common-tags";
import { Argument, Flag } from "discord-akairo";
import { GuildMember, Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { IPokemon } from "../../../models/mongo/pokemon";
import { Roles } from "../../../util/constants";

interface CommandArgs {
    winner: GuildMember;
    loser: GuildMember;
    ref: GuildMember;
    winningTeam: IPokemon[];
    losingTeam: IPokemon[];
    size: number;
    venue: string;
    description: string;
}

export default class BattleLogCommand extends KauriCommand {
    private logEmbed?: MessageEmbed;
    private logMessage?: Message;

    public constructor() {
        super("Battle Log", {
            aliases: ["battlelog", "bl", "reflog", "rl"],
            category: "Game",
            channel: "guild",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            defaults: { disabled: true },
            description: "Logs and pays the Battlers and Referee for a battle",
            requiresDatabase: true,
            usage: ["bl"],
            userRoles: [Roles.SeniorReferee, Roles.Referee]
        });
    }

    public async before(message: Message) {
        this.logEmbed = new MessageEmbed()
            .setTitle("Battle Log")
            .setAuthor(`Referee: ${message.member!.displayName}`, message.author!.displayAvatarURL())
            .setColor("1f8b4c")
            .setDescription(stripIndents`To complete the log, respond to each field as you are prompted.
                A description can be provided last.

                Reply **\`back\`** to return to the previous field and edit a response.
                Reply **\`cancel\`** to stop the command.`)
            .setThumbnail("https://i.imgur.com/jBRd5cN.png")
            .addFields({ name: "**Winning Trainer**", value: "\u200b", inline: true });

        this.logMessage = await message.channel.send({ embed: this.logEmbed });
    }

    public async *args(message: Message) {
        if (!this.logEmbed || !this.logMessage) return Flag.fail("No log message");

        const results: { [index: string]: any } = { ref: message.member };

        const args = [{
            id: "winner",
            type: Argument.validate("member", (m, p, v) => v.id !== message.author!.id),
            prompt: {
                retry: (m: Message, d: any) => {
                    if (d.failure && d.failure.value === "author") return "The referee cannot be a battle participant";
                    return `Value "${d.phrase}" is not valid for this field`;
                }
            }
        }, {
            id: "winningTeam",
            type: Argument.union(["back"], "pokemonTeam"),
            prompt: { retry: (m: Message, d: any) => `Unable to resolve ${d.phrase} to a Pokemon` }
        }, {
            id: "loser",
            type: Argument.validate(Argument.union(["back"], "member"), (m, p, v) => {
                if (v instanceof GuildMember)
                    return v.id !== message.author!.id && v.id !== results.winner.id;
                else return true;
            }),
            prompt: {
                retry: (m: Message, d: any) => {
                    if (d.failure && d.failure.value === "author") return "The referee cannot be a battle participant";
                    return `Value "${d.phrase}" is not valid for this field`;
                },
            }
        }, {
            id: "losingTeam",
            type: Argument.union(["back"], "pokemonTeam"),
            prompt: { retry: (m: Message, d: any) => `Unable to resolve ${d.phrase} to a Pokemon` }
        }, {
            id: "venue",
            type: ["back", "Gym", "E4", "LD", "None"],
            prompt: { retry: "Invalid battle venue. Accepted responses are `Gym`, `E4`, `LD` or `None`", }
        }, {
            id: "description",
            type: "string",
            prompt: { time: 300000, retry: "Please provide a description of the battle" }
        }];

        for (let i = 0; i < args.length; i++) {
            if (args[i].id === "venue" && results.size && results.size < 3) {
                results.venue = "None";
                continue;
            }

            const value = yield args[i];

            if (value === "back" && i !== 0) {
                this.retryArg(args[i - 1].id);
                if (args[i].id === "description" && results.size < 3) i -= 3;
                else i -= 2;
            } else {
                results[args[i].id] = value;
                this.displayArg(args[i].id, value);
                if (args[i].id === "losingTeam") {
                    results.size = Math.max(...this.logEmbed.fields.map(f => f.value.split("\n").length));
                }
            }

            if (message.util && message.util.messages) {
                const response = message.util.messages.last();
                // if (response) response.delete();
            }
            this.logMessage.edit(this.logEmbed);
        }

        return results;
    }

    public async exec(message: Message, { winner, loser, ref, venue, size }: CommandArgs) {
        if (!this.logEmbed || !this.logMessage) return Flag.fail("No log message");

        const payments = this.calcPayments(size, venue);

        this.logEmbed.addFields({
            name: "**Payments**", value: stripIndents`
        ${winner.displayName}: **${payments.winner.to$()}**
        ${loser.displayName}: **${payments.loser.to$()}**
        ${ref.displayName}: **${payments.ref.to$()}**`
        });
        const preDescription = this.logEmbed.description;
        this.logEmbed.setDescription(`${preDescription}\n\nIf the log is correct, please react to confirm the payments shown`);
        this.logMessage.edit(this.logEmbed);

        const confirm = await this.logMessage.reactConfirm(message.author!.id, 120000);
        if (confirm) {
            try {
                await Promise.all([
                    winner.trainer.pay(payments.winner),
                    loser.trainer.pay(payments.loser),
                    ref.trainer.pay(payments.ref)
                ]);
            } catch (e) {
                this.client.logger.parseError(e);
                return message.channel.embed("error", "Error encountered while logging payments to databse.");
            }

            this.logMessage.reactions.removeAll();
            this.client.logger.reflog(message, this.logMessage);
            this.logEmbed.setDescription(`${preDescription}\n\nPayments confirmed and logged`);
            this.logMessage.edit(this.logEmbed);
        } else {
            this.logMessage.delete();
        }
    }

    public async afterCancel() {
        if (this.logMessage) this.logMessage.delete();
    }

    private calcPayments(size: number, venue: string) {
        if (venue === "E4") return { winner: 8000, loser: 4000, ref: 6000 };

        let payments;
        switch (size) {
            case 2:
                payments = [1000, 500, 1000];
                break;
            case 3:
                payments = [1500, 500, 1500];
                break;
            case 4:
                payments = [2500, 1000, 2000];
                break;
            case 5:
                payments = [3500, 1500, 2500];
                break;
            case 6:
                payments = [5000, 2500, 4000];
                break;
            default: payments = [0, 0, 0];
        }

        if (venue !== "None" && size > 2) payments = payments.map(p => p += 1000);
        const [winner, loser, ref] = payments;
        return { winner, loser, ref };
    }

    private displayArg(arg: any, value: any) {
        if (!this.logEmbed || !this.logMessage) return Flag.fail("No log message");

        switch (arg) {
            case "winner":
                this.logEmbed.fields[0].name = value.displayName;
                this.logEmbed.fields[0].value = "`Winning team (comma-separated)`";
                break;
            case "winningTeam":
                this.logEmbed.fields[0].value = value.map((p: IPokemon) => p.uniqueName).join("\n");
                this.logEmbed.addFields({ name: "**Losing Trainer**", value: "\u200b", inline: true });
                break;
            case "loser":
                this.logEmbed.fields[1].name = value.displayName;
                this.logEmbed.fields[1].value = "`Losing team (comma-separated)`";
                break;
            case "losingTeam":
                this.logEmbed.fields[1].value = value.map((p: IPokemon) => p.uniqueName).join("\n");
                const size = Math.max(...this.logEmbed.fields.map(f => f.value.split("\n").length));
                this.logEmbed.setTitle(`${size}v${size} Battle Log`);
                if (size > 2) this.logEmbed.addFields({ name: "**Special Venue**", value: "`Gym | E4 | LD | None`" });
                else this.logEmbed.addFields({ name: "**Description**", value: "`Please provide a battle description, including ruleset and clauses (5 minutes)`" });
                break;
            case "venue":
                if (value !== "None") this.logEmbed.title += ` [${value}]`;
                this.logEmbed.spliceFields(2, 1, [
                    { name: "Description", value: "`Please provide a battle description, including ruleset and clauses (5 minutes)`" }
                ]);
                break;
            case "description":
                this.logEmbed.spliceFields(2, 1);
                this.logEmbed.description = value;
                break;
        }
    }

    private retryArg(arg: any) {
        if (!this.logEmbed || !this.logMessage) return Flag.fail("No log message");

        switch (arg) {
            case "winner":
                this.logEmbed.spliceFields(0, 1, [
                    { name: "`Winning Trainer`", value: "\u200b", inline: true }
                ]);
                break;
            case "winningTeam":
                this.logEmbed.spliceFields(1, 1);
                this.logEmbed.fields[0].value = "`Winning team (comma-separated)`";
                break;
            case "loser":
                this.logEmbed.spliceFields(1, 1, [
                    { name: "`Losing Trainer`", value: "\u200b", inline: true }
                ]);
                break;
            case "losingTeam":
                this.logEmbed.spliceFields(2, 1);
                this.logEmbed.fields[1].value = "`Losing team (comma-separated)`";
                break;
            case "venue":
                this.logEmbed.spliceFields(2, 1, [
                    { name: "Special Venue", value: "`Gym | E4 | LD | None`" }
                ]);
                break;
        }
    }
}
