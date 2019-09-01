import { ArgumentRunnerState, ContentParserResult, PromptContentSupplier } from "discord-akairo";
import { ArgumentTypeCaster } from "discord-akairo";
import { Flag } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { GuildMemberStore } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { Failures, runningEnded, runningRetry, runningStart } from "../../../util/EmbeddedContentSuppliers";

export default class JudgeLogCommand extends KauriCommand {
    constructor() {
        super("judgelog", {
            aliases: ["judgelog", "jl"],
            category: "Game",
            description: "Logs and pays the Coordinators and Judge for a contest",
            defaults: { disabled: true }
        });
    }

    public *args(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState) {
        const rank = yield {
            type: [["Normal", "n"], ["Super", "s"], ["Hyper", "h"], ["Master", "m"]],
            prompt: {
                start: runningStart("Which rank was this contest?", "`Normal`, `Super`, `Hyper` or `Master`?"),
                retry: runningRetry("Invalid rank provided\nAccepted responses are `Normal`, `Super`, `Hyper` or `Master`"),
                retries: 1000
            }
        };
        runningEnded(message, rank);

        const members = new GuildMemberStore(message.guild!);

        // const start: PromptContentSupplier = (m, d) => `Please list the four Coordinators in order from 1st to 4th (${members.size}/4)`;
        // const retry: PromptContentSupplier = (m, d) => {
        //     if (d.failure) {
        //         if (d.failure.value === "author") return "";
        //         if (d.failure.value === "unique") return "";
        //         return ";
        //     }
        // };

        const uniqueMember: ArgumentTypeCaster = (m, p) => {
            console.log(p);
            if (!p) return;

            const member = this.client.util.resolveMember(p, m.guild!.members);
            if (!member) return;

            console.log(member.displayName);

            if (member.id === message.author!.id) return Flag.fail("author");
            if (members.has(member.id)) return Flag.fail("unique");
            return member;
        };

        while (members.size < 4) {
            members.add(yield {
                type: uniqueMember,
                match: "phrase",
                prompt: {
                    start: members.size ?
                        runningStart(`Please list the four Coordinators in order from 1st to 4th (${members.size}/4)`, members.map(m => `${m}`).join(" "), true) :
                        runningStart(`Please list the four Coordinators in order from 1st to 4th (${members.size}/4)`, "\u200b"),
                    retry: runningRetry({
                        author: "You can't list yourself as one of the Coordinators",
                        unique: "That Coordinator has already been listed",
                        default: "Unable to find a Coordinator by that name, please try again"
                    } as Failures)
                }
            });
        }

        // const level = yield {
        //     type: ["normal", "super", "hyper", "master"],
        //     prompt: {
        //         start: "Contest level"
        //     }
        // };

        // return { members, level };
    }

    private get rankArg() {
        const modifyRetry: PromptContentSupplier = (m, d) => {
            const last = m.util && m.util.lastResponse ? m.util.lastResponse : null;
            if (last) {
                last.embeds[0].fields[0].value = `Invalid selection - ${last.embeds[0].fields[0].value}`;
                last.edit(last.embeds[0]);
            }
        };
        return {
            type: [["Normal", "n"], ["Super", "s"], ["Hyper", "h"], ["Master", "m"]],
            prompt: {
                start: new MessageEmbed().addField("What rank was the contest?", "`Normal`, `Super`, `Hyper` or `Master`"),
                modifyRetry
            }
        };
    }

    public async exec(message: Message, args: any) {
        console.log(args);
        // const judge = await Trainer.findById(message.author.id);

        // const log = new RichEmbed().setTitle("Contest Log").setColor(0x9b59b6);
        // const logMessage = await message.channel.send(log);

        // const rank = await this.getRank(message, logMessage);
        // if (!rank) { return; }

        // const trainers = await this.getTrainers(message, logMessage);
        // if (!trainers) { return; }

        // const payments = this.getPayments(rank);

        // log.fields.splice(log.fields.length - 1);
        // let pays = trainers.map(
        //     (v, i) => `${i + 1} | <@${v._id}> | $${payments[i].toLocaleString()}`
        // );
        // pays.push(`Judge | <@${judge._id}> | $${payments[4].toLocaleString()}`);
        // pays = pays.join("\n");

        // log.addField("Payments", pays);
        // await logMessage.edit(log);

        // const ties = await this.getTies(message, logMessage);
        // if (ties === null) { return; }

        // if (ties[0] !== "0") {
        //     const tiedSpots = ties.map(x => x - 1);
        //     const [start, end, length] = [
        //         tiedSpots[0],
        //         tiedSpots[tiedSpots.length - 1] + 1,
        //         tiedSpots.length
        //     ];
        //     payments.fill(
        //         payments.slice(start, end).reduce((total, num) => total + num) / length,
        //         start,
        //         end
        //     );
        // }

        // pays = trainers.map((v, i) => `${i + 1} | <@${v._id}> | $${payments[i].toLocaleString()}`);
        // pays.push(`Judge | <@${judge._id}> | $${payments[4].toLocaleString()}`);
        // pays = pays.join("\n");

        // log.fields[log.fields.length - 1].value = pays;
        // await logMessage.edit(log);

        // const desc = await this.getDescription(message, logMessage);
        // if (!desc) { return null; }

        // log.setFooter("React to confirm that this log is correct");
        // await logMessage.edit(log);

        // if (await logMessage.reactConfirm(message.author.id)) {
        //     logMessage.clearReactions();

        //     const doPayments = trainers
        //         .map((t, i) => [t.modifyCash(payments[i]), t.modifyContestCredit(payments[0])])
        //         .flat();
        //     doPayments.push(judge.modifyCash(payments[4]), judge.modifyContestCredit(payments[4]));
        //     try {
        //         await Promise.all(doPayments);
        //     } catch (e) {
        //         e.key = "judgelog";
        //         throw e;
        //     }

        //     log.setTitle(`${log.title} (Confirmed)`);
        //     delete log.footer;
        //     logMessage.edit(log);
        //     return message.client.logger.judgelog(message, logMessage);
        // } else { return log.delete(); }
    }
    /*
        private async getDescription({ channel, author }: Message, logMessage: Message) {
            if (!author) { return; }

            const log = new MessageEmbed(logMessage.embeds[0]);
            log.addField("Description", "Please provide a description or log URL for the contest");
            const field = log.fields[log.fields.length - 1];

            await logMessage.edit(log);

            const filter = (m: Message) => m.author !== null && m.author.id === author.id;
            const description = await channel.awaitMessages(filter, { max: 1, time: 60000 });

            if (!description.first()) {
                field.value = "Prompt timed out before a description was provided";
                await logMessage.edit(log);
                return null;
            }

            const response = description.first()!.content;
            log.fields.slice(log.fields.length - 1);
            log.setDescription(response);
            await logMessage.edit(log);
            return response;
        }

        private async getTies({ author }: Message, logMessage: Message) {
            const log = new MessageEmbed(logMessage.embeds[0]);
            log.addField(
                "Ties",
                `Click the number that corresponds to the tied positions
                0 | No tie
                1 | 1st / 2nd
                2 | 2nd / 3rd
                3 | 3rd / 4th
                4 | 1st / 2nd / 3rd
                5 | 2nd / 3rd / 4th`
            );
            const field = log.fields[log.fields.length - 1];
            await logMessage.edit(log);

            const ties = ["0", "1,2", "2,3", "3,4", "1,2,3", "2,3,4"];
            const { zero, one, two, three, four, five } = require("../util/emojiCharacters");
            const reacts = [zero, one, two, three, four, five];

            for (const r of reacts) { await logMessage.react(r); }

            const filter = (r, u) => reacts.includes(r.emoji.name) && u.id === author.id;
            const tie = await logMessage.awaitReactions(filter, { max: 1, time: 30000 });

            await logMessage.clearReactions();
            if (!tie.first()) {
                field.value = "Tie selection timed out";
                await logMessage.edit(log);
                return null;
            }

            log.fields.splice(log.fields.length - 1);
            await logMessage.edit(log);
            return ties[reacts.indexOf(tie.first().emoji.name)].split(",");
        }

        private getPayments(rank: string) {
            switch (rank) {
                case "Normal":
                case "Super":
                    return [2000, 1500, 1000, 500, 1500];
                case "Hyper":
                case "Master":
                    return [2500, 2000, 1500, 1000, 1500];
            }
        }

        private async getTrainers({ channel, author }: Message, logMessage: Message) {
            const log = new MessageEmbed(logMessage.embeds[0]);
            log.addField(
                "Coordinators",
                `Please mention the four Coordinators who participated in a single message
                Mentions should be in order from first to fourth
                Tied positions can be specified in the next step`
            );
            const field = log.fields[log.fields.length - 1];

            await logMessage.edit(log);

            const filter = m =>
                m.author.id === author.id &&
                m.mentions.users.size === 4 &&
                !m.mentions.users.has(m.author.id);
            const trainerPrompt = await channel.awaitMessages(filter, { maxMatches: 1, time: 60000 });

            if (!trainerPrompt.first()) {
                field.value = "Prompt timed out before Coordinators were mentioned";
                await logMessage.edit(log);
                return null;
            }

            const response = trainerPrompt.first().content;
            const trainers = await Promise.all(
                response
                    .split(" ")
                    .filter(t => t.match(MessageMentions.USERS_PATTERN))
                    .map(t => {
                        return Trainer.findById(t.replace(/[<@!>]/g, ""));
                    })
            );

            if (trainers.includes(null) || trainers.length !== 4) {
                field.value =
                    "A Trainer profile could not be fetched for one or more of the Coordinators";
                await logMessage.edit(log);
                return null;
            }

            return trainers;
        }*/
}
