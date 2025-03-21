import type {
	APIActionRowComponent as ActionRowComponent,
	APIButtonComponent as ButtonComponent,
	ComponentType as _ComponentType,
} from "@discordjs/core";

export enum ComponentV2Type {
	Section = 9,
	TextDisplay = 10,
	Thumbnail = 11,
	MediaGallery = 12,
	File = 13,
	Separator = 14,
	Container = 17,
}

export type UnfurledMediaItem = {
	// Supports arbitrary urls _and_ attachment://<filename> references
	url: string;
};

export type BaseComponent = {
	id?: number;
	type: ComponentV2Type;
};

export type SectionComponent = BaseComponent & {
	// DO NOT hardcode assumptions that this will only be Thumbnail.
	// Eventually this will support Button and others
	accessory: ButtonComponent | ThumbnailComponent;
	// DO NOT hardcode assumptions this will always be TextDisplayComponents.
	// We could potentially add other components in the future
	components: TextDisplayComponent[];
	type: ComponentV2Type.Section;
};

export type TextDisplayComponent = BaseComponent & {
	content: string;
	type: ComponentV2Type.TextDisplay;
};

export type ThumbnailComponent = BaseComponent & {
	description?: string;
	media: UnfurledMediaItem;
	spoiler?: boolean;
	type: ComponentV2Type.Thumbnail;
};

export type MediaGalleryItem = {
	description?: string;
	media: UnfurledMediaItem;
	spoiler?: boolean;
};

export type MediaGalleryComponent = BaseComponent & {
	items: MediaGalleryItem[];
	type: ComponentV2Type.MediaGallery;
};

export enum SeparatorSpacingSize {
	Small = 1,
	Large = 2,
}

export type SeparatorComponent = BaseComponent & {
	divider?: boolean;
	spacing?: SeparatorSpacingSize;
	type: ComponentV2Type.Separator;
};

export type FileComponent = BaseComponent & {
	// The UnfurledMediaItem ONLY supports attachment://<filename> references
	file: UnfurledMediaItem;
	spoiler?: boolean;
	type: ComponentV2Type.File;
};

export type ContainerComponent = BaseComponent & {
	accent_color?: number;
	components: (ActionRowComponent<any> | FileComponent | MediaGalleryComponent | SectionComponent | SeparatorComponent | TextDisplayComponent)[];
	spoiler?: boolean;
	type: ComponentV2Type.Container;
};
