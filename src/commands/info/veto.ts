import { oneLine, stripIndents } from "common-tags";
import { Message, MessageEmbed } from "discord.js";
import KauriCommand from "../../lib/commands/KauriCommand";

module.exports = class VetoCommand extends KauriCommand {
    constructor() {
        super("veto", {
            aliases: ["veto"],
            category: "Info",
            description: "Provides Veto Tier informaion from the Refpedia",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public async exec(message: Message) {
        const embed = new MessageEmbed().setTitle("Veto Tiers")
            .setDescription(stripIndents`${oneLine`When multiple effects act on the same Pokemon to prevent the execution of a move,
            the referee will first check one effect, then the next, and so on.
            This is the order that is checked.
            When a move is vetoed from being executed, no other checks are performed.`}

            1. Freeze / Sleep
            2. Truant
            3. Disable
            4. Imprison
            5. Heal Block
            6. Confuse
            7. Flinch
            8. Taunt
            9. Gravity
            10. Attract
            11. Paralysis`);

        return message.util!.send(embed);
    }
};
