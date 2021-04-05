import { InteractionCommand } from "../../lib/commands/InteractionCommand";

export default class extends InteractionCommand {
  constructor() {
    super("move", {
      name: "move",
      description: "Look-up Pokemon attack data",
      options: [],
      guild: true
    });
  }
}