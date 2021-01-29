import { MessageEmbed, Util } from "discord.js";
import { CreativeRank, Location, PokemonAbility, PokemonAttack, PokemonMega, Species } from "urpg.js";
import KauriClient from "../client/KauriClient";
import { ICON_BASE, SPRITE_BASE } from "../util/constants";
import { Color } from "./mongo/color";

export class Pokemon {
  name: string;
  displayName: string;
  formName: string;
  dexno: number;
  type1: string;
  type2?: string;
  abilities: PokemonAbility[];
  attacks: PokemonAttack[];
  maleAllowed: boolean;
  femaleAllowed: boolean;

  hp: number;
  attack: number;
  defense: number;
  specialDefense: number;
  specialAttack: number;
  speed: number;

  height: any;
  weight: any;

  pokemart?: number;
  berryStore?: number;

  storyRank?: CreativeRank;
  artRank?: CreativeRank;
  parkRank?: CreativeRank;
  parkLocation?: Location;

  mega: PokemonMega[];

  // matchRating?: number;

  constructor(data: Species) {

    this.name = data.name;
    this.displayName = data.displayName;
    this.formName = data.formName;
    this.dexno = data.dexno;
    this.type1 = data.type1;
    this.type2 = data.type2;
    this.abilities = data.abilities;
    this.attacks = data.attacks;
    this.maleAllowed = data.maleAllowed;
    this.femaleAllowed = data.femaleAllowed;

    this.hp = data.hp;
    this.attack = data.attack;
    this.defense = data.defense;
    this.specialAttack = data.specialAttack;
    this.specialDefense = data.specialDefense;
    this.speed = data.speed;

    this.height = data.height;
    this.weight = data.weight;

    this.pokemart = data.pokemart > 0 ? data.pokemart : undefined;
    this.berryStore = data.contestCredits > 0 ? data.contestCredits : undefined;

    this.storyRank = data.storyRank;
    this.artRank = data.artRank;
    this.parkRank = data.parkRank;
    this.parkLocation = data.parkLocation;

    this.mega = data.megaEvolutions || [];
    this.mega.forEach(m => m.type2 = m.type2 !== "NONE" ? m.type2 : undefined);

    // this.matchRating = apiData.rating;
  }

  public get genders() {
    if (this.maleAllowed && this.femaleAllowed) return ["Male", "Female"];
    if (this.maleAllowed) return ["Male"];
    if (this.femaleAllowed) return ["Female"];
    return ["Genderless"];
  }

  public get prices() {
    if (this.pokemart && this.berryStore) return [`Pokemart: ${this.pokemart.to$()}`, `Berry Store: ${this.berryStore.to$()}`];
    if (this.pokemart) return [`Pokemart: ${this.pokemart.to$()}`];
    if (this.berryStore) return [`Berry Store: ${this.berryStore.to$()}`];
    return null;
  }

  public get ranks() {
    const ranks = [];
    if (this.storyRank) { ranks.push(`Story: ${this.storyRank.name}`); }
    if (this.artRank) { ranks.push(`Art: ${this.artRank.name}`); }
    if (this.parkRank && this.parkLocation) {
      ranks.push(`Park: ${this.parkRank.name} (${this.parkLocation.name})`);
    }

    return ranks.length ? ranks : null;
  }

  public get stats() {
    const { hp, attack, defense, specialAttack, specialDefense, speed } = this;
    return { hp, attack, defense, specialAttack, specialDefense, speed };
  }

  public get suffix() {
    if (!this.name.includes("-")) return "";
    return `-${this.name.split("-")[1].toLowerCase()}`;
  }

  public megaStats(index: number) {
    const { hp, attack, defense, specialAttack, specialDefense, speed } = this.mega[index];
    return { hp, attack, defense, specialAttack, specialDefense, speed };
  }

  private attacksByMethod(method: string) {
    return this.attacks.reduce((acc, val) => val.method === method ? [...acc, val.name] : acc, [] as string[]);
  }

  async dex(client: KauriClient, query?: string, reactions: boolean = true) {
    const color = await Color.getColorForType(this.type1.toLowerCase());
    const [t1, t2] = [client.getTypeEmoji(this.type1), client.getTypeEmoji(this.type2, true)];

    const stats = Object.values(this.stats);
    const statsStringArray = stats.map(s => s.toString().padEnd(3, " "));
    const statsStrings = `HP  | Att | Def | SpA | SpD | Spe\n${statsStringArray.join(" | ")}`;

    const embed = new MessageEmbed()
      .setTitle(`URPG Ultradex - ${this.displayName}${this.formName ? ` - ${this.formName}` : ""} (#${this.dexno.toString().padStart(3, "0")})`)
      .setURL(`https://pokemonurpg.com/pokemon/${encodeURIComponent(this.name)}`)
      .setColor(color)
      .setThumbnail(`${ICON_BASE}${this.dexno}${this.suffix}.png`)
      .setImage(`${SPRITE_BASE}${this.dexno}${this.suffix}.gif`)
      .addFields([{
        name: `**${this.type2 ? "Types" : "Type"}**`,
        value: `${t1} ${this.type1.toTitleCase()}${this.type2 ? ` | ${this.type2.toTitleCase()} ${t2}` : ""}`
      }, {
        name: "**Abilities**",
        value: this.abilities.map(a => (a.hidden ? `${a.name} (HA)` : a.name)).join(" | ")
      }, {
        name: "**Legal Genders**",
        value: this.genders.join(" | ")
      }, {
        name: "**Height and Weight**",
        value: `${this.height}m, ${this.weight}kg`
      }, {
        name: "**Stats**",
        value: `\`\`\`${statsStrings}\`\`\``
      }]);
    if (reactions) embed.setFooter("Reactions | [M] View Moves ");

    // if (this.matchRating && this.matchRating !== 1 && query) {
    //     const percent = Math.round(this.matchRating * 100);
    //     embed.setDescription(`Closest match to your search "${query}" with ${percent}% similarity`);
    // }

    if (this.ranks) embed.addFields({ name: "**Creative Ranks**", value: this.ranks.join(" | ") });
    if (this.prices) embed.addFields({ name: "**Price**", value: `${this.prices.join(" | ")}` });

    if (reactions) {
      if (this.mega.length === 1) {
        const mp = this.mega[0].name.split("-")[1];
        embed.footer!.text += `| [${mp === "Mega" ? "X" : "P"}] View ${mp}`;
      }
      if (this.mega.length === 2) { embed.footer!.text += "| [X] View Mega-X | [Y] View Mega-Y"; }
    }

    return embed;
  }

  async learnset(query?: string) {
    const color = await Color.getColorForType(this.type1.toLowerCase());
    const count = this.attacks.filter(a => a.method !== "LEVEL-UP").length;

    const embed = new MessageEmbed()
      .setTitle(`${this.displayName} can learn ${count} move(s)`)
      .setColor(color)
      .setFooter("Reactions | ⬅️ Back ");

    // if (this.matchRating && this.matchRating !== 1 && query) {
    //     const percent = Math.round(this.matchRating * 100);
    //     embed.setDescription(`Closest match to your search "${query}" with ${percent}% similarity`);
    // }

    const learnset: { [index: string]: string[] } = {};

    if (this.attacks.find(a => a.method === "LEVEL-UP")) learnset["By Level"] = this.attacksByMethod("LEVEL-UP");
    if (this.attacks.find(a => a.method === "TM")) learnset["By TM"] = this.attacksByMethod("TM");
    if (this.attacks.find(a => a.method === "HM")) learnset["By HM"] = this.attacksByMethod("HM");
    if (this.attacks.find(a => a.method === "BREEDING")) learnset["By BM"] = this.attacksByMethod("BREEDING");
    if (this.attacks.find(a => a.method === "MOVE TUTOR")) learnset["By MT"] = this.attacksByMethod("MOVE TUTOR");
    if (this.attacks.find(a => a.method === "SPECIAL")) learnset["By SM"] = this.attacksByMethod("SPECIAL");

    // 1024 character splitter
    for (const method of Object.keys(learnset)) {
      learnset[method] = Util.splitMessage(learnset[method].sort((a, b) => a.localeCompare(b)).join(", "), { char: ", ", maxLength: 1024 });
    }

    for (const [name, value] of Object.entries(learnset)) {
      if (value.length === 1) embed.addFields({ name: `**${name}**`, value: value[0] });
      else embed.addFields(value.map((v, i) => ({ name: `**${name} (${i + 1})**`, value: v })));
    }

    return embed;
  }

  async megaDex(client: KauriClient, whichMega: number) {
    const mega = this.mega[whichMega];

    const color = await Color.getColorForType(this.type1.toLowerCase());
    const [t1, t2] = [client.getTypeEmoji(this.type1), client.getTypeEmoji(this.type2, true)];

    const stats = Object.values(this.megaStats(whichMega));
    const statsStringArray = stats.map(s => s.toString().padEnd(3, " "));
    const statsStrings = `HP  | Att | Def | SpA | SpD | Spe\n${statsStringArray.join(" | ")} `;

    const embed = new MessageEmbed()
      .setTitle(`URPG Ultradex - ${mega.displayName} (#${mega.dexno.toString().padStart(3, "0")})`)
      .setURL(`https://pokemonurpg.com/pokemon/${encodeURIComponent(this.name)}`)
      .setColor(color)
      .setThumbnail(`${ICON_BASE}${mega.dexno}${mega.name.replace(this.name, "").toLowerCase()}.png`)
      .setImage(`${SPRITE_BASE}${mega.dexno}${mega.name.replace(this.name, "").toLowerCase()}.gif`)
      .addFields([{
        name: `** ${mega.type2 ? "Types" : "Type"} ** `,
        value: `${t1} ${mega.type1.toTitleCase()}${mega.type2 ? ` | ${mega.type2.toTitleCase()} ${t2}` : ""}`
      }, {
        name: "**Ability**",
        value: mega.ability.name
      }, {
        name: "**Legal Genders**",
        value: this.genders.join(" | ")
      }, {
        name: "**Height and Weight**",
        value: `${mega.height}m, ${mega.weight}kg`
      }, {
        name: "**Stats**",
        value: `\`\`\`${statsStrings}\`\`\``
      }])
      .setFooter("Reactions | ⬅️ Back ");


    return embed;
  }
}
