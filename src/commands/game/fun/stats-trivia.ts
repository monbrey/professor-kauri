import { stripIndents } from "common-tags";
import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { Pokemon } from "../../../models/Pokemon";
import { SPRITE_BASE } from "../../../util/constants";

interface CommandArgs {
  control: string;
}

export default class extends KauriCommand {
  private running: boolean;
  private next?: NodeJS.Timeout;
  private speciesList?: string[];

  constructor() {
    super("stats-trivia", {
      aliases: ["stats-trivia"],
      category: "Game",
      editable: false,
      description: "Trigger a guessing game using a random Pokemon's stats",
    });

    this.running = false;
  }

  public *args() {
    const control = yield {
      type: ["start", "stop"],
    };

    return { control };
  }

  private async trivia(message: Message) {
    const { urpg } = this.client;
    if (!this.speciesList) this.speciesList = await urpg.species.list();

    const species = this.speciesList[Math.floor(Math.random() * this.speciesList.length)];

    const random = new Pokemon(await urpg.species.fetch(species));
    console.log(species);

    await message.channel.send(new MessageEmbed().setTitle("Who's that Pokemon?").setDescription(stripIndents`\`\`\`
    HP:  ${random.hp}
    Atk: ${random.attack}
    Def: ${random.defense}
    SpA: ${random.specialAttack}
    SpD: ${random.specialDefense}
    Spe: ${random.speed}\`\`\``));

    const filter = (m: Message) => m.content.toLowerCase() === species.toLowerCase();
    const collector = message.channel.createMessageCollector(filter, { max: 1 });

    collector.on("end", collected => {
      const winner = collected.first();
      if (!winner) return;
      message.channel.send(`${winner.author} guessed it correctly with: ${species}!`, { files: [`${SPRITE_BASE}${random.dexno}${random.suffix}.gif`]});

      if(this.running)
        this.next = setTimeout(() => this.trivia(message), 10000);
    });
  }

  public async exec(message: Message, { control }: CommandArgs) {
    if (control === "start") {
      message.channel.send("Starting base-stat trivia mode");
      this.running = true;
      this.next = setTimeout(() => this.trivia(message), 10000);
    } else if (control === "stop") {
      message.channel.send("Stopping base-stat trivia mode after this round");
      this.running = false;
      if(this.next) clearTimeout(this.next);
    }
  }
}
