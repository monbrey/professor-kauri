# Constructing Kauri's Slash Commands

Kauri uses a custom `Command` class module for all slash commands, which in theory is the only place you should ever need to write code in order to contribute a new command.

If written to spec correctly, the command will automatically be deployed to Discord, and loaded into the bot on start-up. \
Automatic command handling includes both autocompletion options, and the execution of the command itself.

## Structure of a Command file

To write a command, your file must export two things:

- A named `data` object
- A default `CustomCommand extends Command` class

### The data object

The data object is the payload sent to Discord in order to deploy the command and have it appear in the client, as well as being passed to the Command constructor method. Kauri uses a slightly extended format of the base discord.js object in order to define some additional features.

For this guide, we're going to build a `/dex` command in a few different ways as an example.

```ts
export const data = {
  name: "dex",
  description: "Get Ultradex data for a Pokemon",
  global: true,
  options: [
    {
      name: "species",
      description: "Pokemon species to search for",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    }
  ]
} as const;
```

- `name` - The name of the command. This is what users will need to type after the /. \
This cannot include capital letters or spaces.
- `description` - Tell people what the command does, in 100 characters or less.
- `global` - Global commands are also available in DMs, rather than just the server. \
Keep in mind that these can take up to an hour to deploy after any changes to the data object.
- `options` - The options for the command - you can have none if you want. The structure of the option is:
  - `name` - The name for the option, displayed in the clickable pills. Defines the `name:value` format.
  - `description` - Tell people what to use this option for.
  - `type` - The type of option this is, in this case a STRING. \
Use the `ApplicationCommandOptionTypes` enum to define this. \
Other primitive option types include `INTEGER` (whole number), `NUMBER` (decimal), `USER`, `CHANNEL`, `ROLE` and `BOOLEAN`.
  - `required` - Ensures that this option is provided before the slash command can be used.

The `as const` at the end is always required - it makes this object read-only and enables some fancy parsing later. Don't question it, just do it.

### The Command class

With the above object defined, you can now define your Command class and export it from the file also.

As a minimum, the class must `extend Command` and must have a `public exec` method, which can optionally be async. There's no need to define a constructor - if your data object is correct, the base constructor will do it's job automatically.

```ts
export default class DexCommand extends Command {
  public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
    interaction.reply({ content: args.species });
  }
}
```

The exec method receives two parameters:

- `interaction` - The `CommandInteraction` object from discord.js. \
This class contains all the data received from Discord for this interaction, and is where you call methods to respond.
- `args` - An object with named properties for each option defined in the `data` object.

Using the above examples, you'll remember we defined a STRING type option called "species". That means we can access `args.species` which will contain the string the user provided! The `ArgumentsOf<typeof data>` ensures that the TypeScript type systems knows this property exists, and knows that it will be a string! That's the fancy parsing I made reference to earlier.

We `interaction.reply` this string back to Discord, at this stage simply parroting back the same value. Replies support text, embeds and components, as well as only being shown to the user who executed the command. For all of that I recommend referring to the [discord.js guide](https://discordjs.guide/interactions/replying-to-slash-commands.html)

## Advanced data parsing

### Autocompletion

Autocompletion is a relatively new feature that allows bots to provide a list of choices to the user as they enter a string option, requiring that they select one. This is a powerful way to ensure good data validation *before* the data ever even reached the exec method of the command - they can only select choices you provide. 

If you want to see this in practice, Kauri's `/dex` command currently utilises this by partial-matching the string entry with the list of all Pokemon, and showing the closest matches. To do it yourself though, simply add the `autocomplete` property to the option.

```ts
export const data = {
  name: "dex",
  description: "Get Ultradex data for a Pokemon",
  global: true,
  options: [
    {
      name: "species",
      description: "Pokemon species to search for",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      autocomplete: true, // add this new line
    }
  ]
} as const;
```

With this additional property, Discord will send interactions to the bot as the user types. You can receive and respond to these by adding an additional `autocomplete` method to the Command class. 

```ts
export default class DexCommand extends Command {
  public async autocomplete(interaction: AutocompleteInteraction, arg: CommandInteractionOption): Promise<void> {
    // Check that the arg is a string, so TypeScript doesn't complain about being unsure
    // No fancy automatic parsing for this one
    if (typeof arg.value !== "string") {
      return;
    }

    // You'd write much smarter logic than hardcoding it like this normally
    // interaction.respond with an array of name/value pairs, as follows
    if(arg.value === "Char") {
      interaction.respond([
        { name: "Charmander", value: "Charmander" },
        { name: "Charmeleon", value: "Charmeleon" },
        { name: "Charizard", value: "Charizard" }, 
        { name: "Chimchar", value: "Chimchar" },
      ])
    } else if(arg.value === "Saur") {
      interaction.respond([
        { name: "Bulbasaur", value: "Bulbasaur" },
        { name: "Ivysaur", value: "Ivysaur" },
        { name: "Venusaur", value: "Venusaur" }, 
      ])
    }
  }

  public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
    interaction.reply({ content: args.species });
  }
}
```

When the user selects one of these options the bot responds with, the normal interaction will come through to the `exec` method.

### Type Augmentation

Kauri's arguments parser also features an advanced augmentation mechanism which allows simple string arguments to be turned into objects fetched from either the Infohub API, or Kauri's own database. This is achieved with another additional property in the option, `augmentTo`.

```ts
export const data = {
  name: "dex",
  description: "Get Ultradex data for a Pokemon",
  global: true,
  options: [
    {
      name: "species",
      description: "Pokemon species to search for",
      type: ApplicationCommandOptionTypes.STRING,
      augmentTo: AugmentationTypes.Pokemon, // add this new line
      required: true,
    }
  ]
} as const;
```

Note: This property is not sent to Discord, so this won't need redeployment.

With this property added, Kauri will automatically look up the string value provided against the Pokemon data source, and replace the `args.species` property accordingly.

```ts
export default class DexCommand extends Command {
  public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
    // args.species is no longer a string, and is now a Pokemon class object
    console.log(args.species.displayName);
    console.log(args.species.dexno);
    console.log(args.species.type1, args.species.type2);

    // The Pokemon class also includes a method which generates the dex embed, for ease of use
    // This method requires the client passed into it for some additional data
    await interaction.reply({ embeds: [args.species.dex(this.client)] });
  }
}
```

More information about the database and API models will be in separate documentation.