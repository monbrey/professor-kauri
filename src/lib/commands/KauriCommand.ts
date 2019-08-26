import { Command, CommandOptions } from "discord-akairo";

declare module "discord-akairo" {
    interface Command {
        defaults: {
            disabled: boolean;
            configurable: boolean;
        };
    }
}

interface KauriCommandOptions extends CommandOptions {
    defaults?: {
        disabled?: boolean;
        configurable?: boolean;
    };
}

const COMMAND_DEFAULTS = {
    disabled: false,
    configurable: true
};

export class KauriCommand extends Command {
    constructor(id: string, options?: KauriCommandOptions) {
        super(id, options);

        this.defaults = Object.assign({}, COMMAND_DEFAULTS, options ? options.defaults : {});
        console.log(id, this.defaults);
    }
}
