import type {
	API,
	APIButtonComponent,
	APIChatInputApplicationCommandGuildInteraction,
	ComponentType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";
import {
	ApplicationIntegrationType,
	ButtonStyle,
	InteractionContextType,
	MessageFlags,
} from "@discordjs/core";
import { stripIndents } from "common-tags";

type UnfurledMediaItem = {
	// Supports arbitrary urls _and_ attachment://<filename> references
	url: string;
};

type BaseComponent = {
	id?: number;
	type: ComponentType;
};

type SectionComponent = BaseComponent & {
	// DO NOT hardcode assumptions that this will only be Thumbnail.
// Eventually this will support Button and others
	accessory?: APIButtonComponent | ThumbnailComponent;
	// DO NOT hardcode assumptions this will always be TextDisplayComponents.
	// We could potentially add other components in the future
	components: TextDisplayComponent[];
	type: ComponentType.Section;
};

type TextDisplayComponent = BaseComponent & {
	content: string;
	type: ComponentType.TextDisplay;
};

type ThumbnailComponent = BaseComponent & {
	description?: string;
	media: UnfurledMediaItem;
	spoiler?: boolean;
	type: ComponentType.Thumbnail;
};

type MediaGalleryItem = {
	description?: string;
	media: UnfurledMediaItem;
	spoiler?: boolean;
};

type MediaGalleryComponent = BaseComponent & {
	items: MediaGalleryItem[];
	type: ComponentType.MediaGallery;
};

enum SeparatorSpacingSize {
	Small = 1,
	Large = 2,
}

type SeparatorComponent = BaseComponent & {
	divider?: boolean;
	spacing?: SeparatorSpacingSize;
	type: ComponentType.Separator;
};

type FileComponent = BaseComponent & {
	// The UnfurledMediaItem ONLY supports attachment://<filename> references
	file: UnfurledMediaItem;
	spoiler?: boolean;
	type: ComponentType.File;
};

type ContainerComponent = BaseComponent & {
	accent_color?: number;
	components: (FileComponent | MediaGalleryComponent | SectionComponent | SectionComponent | SeparatorComponent | TextDisplayComponent)[];
	spoiler?: boolean;
	type: ComponentType.Container;
};

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "componentsv2",
	description: "Test components v2",
	contexts: [InteractionContextType.Guild],
	integration_types: [ApplicationIntegrationType.UserInstall],
};

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
	const container: ContainerComponent = {
		type: 17,
		components: [
			{
				type: 9,
				components: [
					{
						type: 10,
						content: "### Charmander (#004)",
					},
				],
				accessory: {
					type: 2,
					label: "Ultradex",
					style: ButtonStyle.Link,
					url: "https://pokemonurpg.com/pokemon/Charmander",
				},
			},
			{
				type: 14,
				divider: true,
			},
			{
				type: 9,
				components: [
					{
						type: 10,
						content: stripIndents`
					Type: Fire
					Abilities: Blaze, Solar Power (HA)
					Legal Genders: Male | Female
					Height: 0.6m
					Weight: 8.5kg
					Ranks: Story: Hard | Art: Hard
					Price: Pokémart: $10,000.00
				`,
					},
				],
				accessory: {
					type: 11,
					media: { url: "https://pokemonurpg.com/img/models/4.gif" },
				},
			},
			{
				type: 14,
				divider: true,
			},
			{
				type: 10,
				content: stripIndents`\`\`\`
					HP  | Att | Def | SpA | SpD | Spe
					282 | 203 | 185 | 219 | 199 | 229
				\`\`\``,
			},
		],
	};

	await api.interactions.reply(
		interaction.id,
		interaction.token,
		{
			flags: 1 << 15,
			// @ts-expect-error Using new types
			components: [container],
		},
	);
};
