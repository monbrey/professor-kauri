import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Attack, AttackTarget, ContestMoveType, PokemonType } from 'urpg.js';
import { Color } from './mongo/color';

export class Move implements Partial<Attack> {
  name: string;
  type: PokemonType;
  description: string;
  power: number;
  accuracy: number;
  pp: number;
  category: string;
  target: AttackTarget;
  contact: boolean;
  snatch: boolean;
  substitute: boolean;
  sheerForce: boolean;
  magicCoat: boolean;
  rseContestAttribute: string;
  rseContestMoveType: ContestMoveType;
  dppContestAttribute: string;
  dppContestMoveType: ContestMoveType;
  orasContestAttribute: string;
  orasContestMoveType: ContestMoveType;

  public constructor(attack: Attack) {
    this.name = attack.name;
    this.type = attack.type;
    this.description = attack.description;
    this.power = attack.power;
    this.accuracy = attack.accuracy;
    this.pp = attack.pp;
    this.category = attack.category;
    this.target = attack.target;
    this.contact = attack.contact;
    this.snatch = attack.snatch;
    this.substitute = attack.substitute;
    this.sheerForce = attack.sheerForce;
    this.magicCoat = attack.magicCoat;
    this.rseContestAttribute = attack.rseContestAttribute;
    this.rseContestMoveType = attack.rseContestMoveType;
    this.dppContestAttribute = attack.dppContestAttribute;
    this.dppContestMoveType = attack.dppContestMoveType;
    this.orasContestAttribute = attack.orasContestAttribute;
    this.orasContestMoveType = attack.orasContestMoveType;
  }

  public async info(): Promise<MessageEmbed> {
    const type = `Type: ${this.type.toTitleCase()}`;
    const power = `Power: ${this.power ? this.power : '-'}`;
    const acc = `Accuracy: ${this.accuracy ? this.accuracy : '-'}`;
    const pp = `PP: ${this.pp}`;
    const cat = `Category: ${this.category}`;
    const contact = this.contact ? 'Makes contact. ' : '';
    const sf = this.sheerForce ? 'Boosted by Sheer Force. ' : '';
    const sub = this.substitute ? 'Bypasses Substitute. ' : '';
    const snatch = this.snatch ? 'Can be Snatched. ' : '';
    const mc = this.magicCoat ? 'Can be reflected by Magic Coat. ' : '';

    const propString = stripIndents`| ${type} | ${power} | ${acc} | ${pp} | ${cat} |

    ${this.description}

    ${contact}${sf}${sub}${snatch}${mc}`;

    const embed = new MessageEmbed()
      .setTitle(this.name)
      .setDescription(propString)
      .setColor(await Color.getColorForType(this.type.toLowerCase()));

    return embed;
  }
}
