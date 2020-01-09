import { Argument } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { IPokemon } from "../../../models/mongo/pokemon";

interface CommandArgs {
    category: string;
    subCategory: IPokemon | string;
}
export default class MartCommand extends KauriCommand {
    public constructor() {
        super("mart", {
            aliases: ["mart", "pokemart"],
            category: "Game",
            defaults: { disabled: true }
        });
    }

    public *args() {
        const category = yield {
            type: ["pokemon", "moves", "items"],
            prompt: {
                start: "What are you looking to purchase? `pokemon`, `moves` or `items`?",
                retry: "Please select a category: `pokemon`, `moves` or `items`"
            }
        };

        let page;
        switch (category) {
            case "pokemon":
                page = yield {
                    type: Argument.range("integer", 1, 7),
                    prompt: {
                        start: "Which Generation would you like to start browsing from? ",
                        retry: "Please provide a number between 1 and 7",
                    }
                };
                break;
            case "moves":
                page = yield {
                    type: "pokemon",
                    prompt: {
                        start: "Which Pokemon are you buying moves for? For a TM Case, reply `none`"
                    }
                };
                break;
        }
    }

    public async exec(message: Message, { category, subCategory }: CommandArgs) { }
}
