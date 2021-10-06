```js
import { Command } from "@professor-kauri/framework";
import type { CommandInteraction } from "discord.js";

export const data = {
  name: "test",
  description: "A test command",
  options: [{
    name: "string",
    description: "A string",
    type: "STRING",
  }],
  global: true,
};

export default class TestCommand extends Command {
  exec(interaction: CommandInteraction): void {
    console.log("Loaded");

    interaction.reply("Received");
  }
}
```
