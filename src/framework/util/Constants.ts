import { ApplicationCommandPermissionData } from "discord.js";

export enum EmbedColor {
	ERROR = 0xe50000,
	WARN = 0xffc107,
	CANCEL = 0x004a7f,
	SUCCESS = 0x267f00,
	INFO = 0xffffff,
}

export enum Role {
	Head = "584793134475771934",
	Staff = "135868852092403713",
	Approver = "457003662217052163",
	Member = "456993685679243286",
	SeniorReferee = "358431855743336448",
	Referee = "243949285438259201",
	ChiefJudge = "358435669372305408",
	Judge = "243950906683424768",
	LeadGrader = "552232839861633046",
	Grader = "312118803616235523",
	EliteRanger = "419636474825277450",
	Ranger = "312119050484449280",
	ExpertCurator = "419775555488186369",
	Curator = "312119111750647809",
	ElderArbiter = "533356631455694849",
	Arbiter = "533356018005180416",
	FFA = "575087931824275466",
	EventCoordinator = "584764766921293825",
	Auction = "669282056722710552",
	ContentUpkeep = "584764993044611075",
	AdvCoordinator = "806290347479007304",
	MasterTechnician = "419692326638845952",
	StaffAlumni = "244600394733322242",
}

export const DefaultPermissions: ApplicationCommandPermissionData[] = [
	{
		id: "122157285790187530",
		type: "USER",
		permission: true,
	},
	{
		id: Role.Staff,
		type: "ROLE",
		permission: true,
	},
];


export enum TypeColor {
	NONE = 0x000000,
	BUG = 0xA8B820,
	DARK = 0x624D3E,
	DRAGON = 0x7038F8,
	ELECTRIC = 0xF8D030,
	FAIRY = 0xe898e8,
	FIRE = 0xD35400,
	FIGHTING = 0xC03028,
	FLYING = 0xA890F0,
	GHOST = 0x705898,
	GRASS = 0x78C850,
	GROUND = 0xE0C068,
	ICE = 0x98D8D8,
	NORMAL = 0x8A8A59,
	POISON = 0xA040A0,
	PSYCHIC = 0xF85888,
	ROCK = 0xB8A038,
	STEEL = 0xB8B8D0,
	WATER = 0x6890F0,
}
