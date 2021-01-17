import { timeStamp } from "console";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { KauriMessage } from "../../lib/structures/KauriMessage";
import { Roles } from "../../util/constants";

export default class extends KauriCommand {
  constructor() {
    super("create-channel", {
      aliases: ["create-channel"],
      category: "Admin",
      description: "Create a new channel. Requires content-upkeep role or higher",
      clientPermissions: ["MANAGE_CHANNELS"],
      userRoles: [Roles.Staff, Roles.ContentUpkeep]
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const parentID = args.get("category");
    const parent = message.guild?.channels.cache.get(parentID)?.type === "category" ?
      parentID :
            message.guild?.channels.cache.get(parentID)?.parentID;

    if (!parent) {
      // @ts-ignore
      return this.client.api.interactions(message.id)(message.interaction.token).callback.post({
        data: {
          type: 3,
          data: {
            content: "Supplied category not found, or supplied channel is not in a category"
          }
        }
      });
    }

        message.guild?.channels.create(args.get("name"), { type: "text", parent });
  }
}