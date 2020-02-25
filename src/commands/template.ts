/**
 * Import the Types from external libraries and other files
 */
import { Message } from "discord.js";
import { KauriCommand } from "../lib/commands/KauriCommand";
import { Roles } from "../util/constants";

/**
 * [1]. All commands in Kauri are classes which extend KauriCommand
 * KauriCommand is an extended implementation of AkairoCommand:
 *     https://discord-akairo.github.io/#/docs/main/master/basics/commands
 *     https://discord-akairo.github.io/#/docs/main/master/class/Command
 * VSC should be able to auto-insert these dependencies for you
 */
export default class ReloadCommand extends KauriCommand {
    constructor() {
        // The first argument to the constructor is the command ID, and must be unique
        super("command", {
            aliases: ["c", "cmd", "command"],
            /**
             * [REQUIRED]
             * Aliases are the calls signature of the command, eg !c, !cmd, and !command
             * This is equivalent to the if(lowmessage.indexOf(alias) == 0) check in Recordbot I believe
             */
            args: [{
                id: "arg1",
                type: "string"
            }, {
                id: "arg2",
                type: "number",
                default: 5
            }],
            /**
             * [OPTIONAL]
             * Arguments capture any additional content after the call signature, and parse it to the right type
             * Akairo has a very powerful, but also complex method of parsing arguments
             *     https://discord-akairo.github.io/#/docs/main/master/arguments/arguments
             */
            category: "Category",
            /**
             * [PREFERRED]
             * Defines the category to appear in for !help
             */
            channel: "guild",
            /**
             * [OPTIONAL]
             * Restricts this command to only be used in Guild channels (No DM)
             * Relevant whenever GuildMember or Role data is required
             */
            clientPermissions: ["SEND_MESSAGES"],
            /**
             * [OPTIONAL]
             * Array of permission flags that the bot needs to run this command
             */
            defaults: {
                disabled: false,
                configurable: true
            },
            /**
             * [OPTIONAL]
             * The command defaults determine if the command is ready to be used
             * and if its config can be changed in the server.
             * If not supplied, the above will be set by default
             */
            ownerOnly: true,
            /**
             * [OPTIONAL]
             * Self-explanatory, restricts usage to Monbrey
             */
            prefix: ",",
            /**
             * [OPTIONAL]
             * Overrides the default prefix for a command
             * NOTE: I aim to write a default function which will add , as a prefix for all migrated commands
             */
            requiresDatabase: false,
            /**
             * [OPTIONAL]
             * Sets a flag to allow graceful erroring if the database is not available
             * Defaults to false if not provided
             */
            usage: "!command <argument>",
            /**
             * [PREFERRED]
             * A string, or an Array of strings, containing examples of how to use the command
             */
            userRoles: [Roles.Staff]
            /**
             * [OPTIONAL]
             * An Array of Role constants (see util/constants.ts) which are allowed to use this command
             */
        });
    }

    /**
     * [REQUIRED]
     * The exec function does the actual command execution after all the call signatures and args are parsed
     * @param message The Message object received from Discord
     * @param args The arguments parsed by Akario
     */
    public async exec(message: Message, args: any) {
        // The arguments received will be an object matching the ID's specified above
        console.log(args.arg1);
        console.log(args.arg2);
    }
}

/**
 * [OPTIONAL]
 * The exec function above uses loosely typed arguments
 * To maintain static typing, an Interface can be defined to match the args, and define the type
 * The exec function would then look like public async exec(message: Message, args: CommandArgs) {
 */
interface CommandArgs {
    arg1: string;
    arg2: number;
}

