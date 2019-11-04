import { Command, CommandOptions } from "discord-akairo";
import { RoleResolvable } from "discord.js";
import Roles from "../../util/roles";
import { Message } from "discord.js";

declare module "discord-akairo" {
    interface Command {
        defaults: {
            disabled: boolean;
            configurable: boolean;
        };
        userRoles?: Roles[];
    }
}

interface KauriCommandOptions extends CommandOptions {
    defaults?: {
        disabled?: boolean;
        configurable?: boolean;
    };
    userRoles?: Roles[];
}

const COMMAND_DEFAULTS = {
    disabled: false,
    configurable: true
};

export class KauriCommand extends Command {
    constructor(id: string, options?: KauriCommandOptions) {
        super(id, options);

        this.defaults = Object.assign({}, COMMAND_DEFAULTS, options ? options.defaults : {});
        this.userRoles = options?.userRoles;
    }

    public afterCancel?(): void;
    public async onBlocked?(message: Message): Promise<any>;
}
