/* eslint-disable no-unused-vars */
import { ApplicationCommandPermissions } from 'discord.js';

export enum Roles {
  Head = '584793134475771934',
  Staff = '135868852092403713',
  Approver = '457003662217052163',
  Member = '456993685679243286',
  SeniorReferee = '358431855743336448',
  Referee = '243949285438259201',
  ChiefJudge = '358435669372305408',
  Judge = '243950906683424768',
  LeadGrader = '552232839861633046',
  Grader = '312118803616235523',
  EliteRanger = '419636474825277450',
  Ranger = '312119050484449280',
  ExpertCurator = '419775555488186369',
  Curator = '312119111750647809',
  ElderArbiter = '533356631455694849',
  Arbiter = '533356018005180416',
  FFA = '575087931824275466',
  EventCoordinator = '584764766921293825',
  Auction = '669282056722710552',
  ContentUpkeep = '584764993044611075',
  AdvCoordinator = '806290347479007304',
  MasterTechnician = '419692326638845952',
  StaffAlumni = '244600394733322242',
	Archives = '872213460086308874'
}

export enum Categories {
  Battles = '358430499146039299',
  Contests = '358433546492444675',
}

export const SPRITE_BASE = 'https://pokemonurpg.com/img/sprites/';
export const ICON_BASE = 'https://pokemonurpg.com/img/icons/';

export const MongooseOptions = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  writeConcern: {
    w: 'majority',
  },
};

export const InhibitorReasons = {
  CHANNEL_DISABLED: 'CHANNEL_DISABLED',
  GUILD_DISABLED: 'GUILD_DISABLED',
  ROLE_NOT_PERMITTED: 'ROLE_NOT_PERMITTED',
  NO_DATABASE: 'NO_DATABASE',
};

export const EmbedColors: { [index: string]: number } = {
  ERROR: 0xe50000,
  WARN: 0xffc107,
  CANCEL: 0x004a7f,
  SUCCESS: 0x267f00,
  INFO: 0xffffff,
};

export const DefaultPermissions: ApplicationCommandPermissions[] = [
  {
    id: '122157285790187530',
    type: 'USER',
    permission: true,
  },
  {
    id: Roles.Staff,
    type: 'ROLE',
    permission: true,
  },
];
