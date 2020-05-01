import { Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { Species } from "urpg.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

interface CommandArgs {
    query: Species | number;
    target: Species | number;
}

module.exports = class SpeedCommand extends KauriCommand {
    constructor() {
        super("Speed", {
            aliases: ["speed"],
            category: "Info",
            separator: ",",
            description: "Provides information on speed-based moves, between two Pokemon or Speed values",
            usage: ["speed <attackerc| number>, <target | number>"],
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: Argument.union("number", "api-pokemon"),
            prompt: {
                start: "> Please provide the name of a Pokemon to lookup as the attacker, or an integer Speed stat"
            }
        };

        const target = yield {
            type: Argument.union("number", "api-pokemon"),
            prompt: {
                start: "> Please provide the name of a Pokemon to lookup as the target, or an integer Speed stat"
            }
        };

        return {
            query: query.value ? query.value : query,
            target: target.value ? target.value : target
        };
    }

    public async exec(message: Message, { query, target }: CommandArgs) {
        const qName = typeof query === "number" ? query : query.name;
        const tName = typeof target === "number" ? target : target.name;

        if (!qName || !tName) {
            this.client.logger.info({ key: "speed", search: message.util?.parsed?.content, result: "none" });
            return;
        }

        const qValue = typeof query === "number" ? query : query.speed;
        const tValue = typeof target === "number" ? target : target.speed;

        this.client.logger.info({
            key: "speed",
            search: message.util?.parsed?.content,
            result: `${qName} and ${tName}`
        });

        const embed = new MessageEmbed()
            .setTitle(`${qName} vs ${tName}`)
            .setDescription(`**Attacking Speed**: ${qValue}\n**Defending Speed**: ${tValue}`)
            .addFields([
                { name: "**Electro Ball**", value: `${this.calcElectro(qValue, tValue)} BP`, inline: true },
                { name: "**Gyro Ball**", value: `${this.calcGyro(qValue, tValue)} BP`, inline: true }
            ]);

        return message.util!.send(embed);
    }

    private calcElectro(attacker: number, defender: number) {
        const percentage = ((defender / attacker) * 100);

        if (percentage > 100 || percentage === 0) return 40;
        if (percentage.between(50.01, 100)) return 60;
        if (percentage.between(33.34, 50)) { return 80; }
        if (percentage.between(25.01, 33.33)) { return 120; }
        if (percentage.between(0.01, 25)) { return 150; }

        return 0;
    }

    private calcGyro(attacker: number, defender: number) {
        if (attacker === 0) return 1;

        return Math.min(150, Math.floor((25 * defender / attacker) + 1));
    }
};
