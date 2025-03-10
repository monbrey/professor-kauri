export type UnfurledMediaItem = {
	// Supports arbitrary urls _and_ attachment://<filename> references
	url: string;
};

export type BaseComponent = {
	id?: int;
	type: ComponentType; // int32, auto generated via increment if not provided
};

export type SectionComponent = BaseComponent & {
	// DO NOT hardcode assumptions that this will only be Thumbnail.
// Eventually this will support Button and others
	accessory: ButtonComponent | ThumbnailComponent;
	// DO NOT hardcode assumptions this will always be TextDisplayComponents.
	// We could potentially add other components in the future
	components: TextDisplayComponent[];
	type: ComponentType.Section;
};

export type TextDisplayComponent = BaseComponent & {
	content: string;
	type: ComponentType.TextDisplay;
};

export type ThumbnailComponent = BaseComponent & {
	description?: string;
	media: UnfurledMediaItem;
	spoiler?: boolean;
	type: ComponentType.Thumbnail;
};

export type MediaGalleryItem = {
	description?: string;
	media: UnfurledMediaItem;
	spoiler?: boolean;
};

export type MediaGalleryComponent = BaseComponent & {
	items: MediaGalleryItem[];
	type: ComponentType.MediaGallery;
};

export enum SeparatorSpacingSize {
	Small = 1,
	Large = 2,
}

export type SeparatorComponent = BaseComponent & {
	divider?: boolean;
	spacing?: SeparatorSpacingSize;
	type: ComponentType.Separator;
};

export type FileComponent = BaseComponent & {
	// The UnfurledMediaItem ONLY supports attachment://<filename> references
	file: UnfurledMediaItem;
	spoiler?: boolean;
	type: ComponentType.File;
};

export type ContainerComponent = BaseComponent & {
	accent_color?: number;
	components: (ActionRowComponent | FileComponent | MediaGalleryComponent | SectionComponent | SeparatorComponent | TextDisplayComponent)[];
	spoiler?: boolean;
	type: ComponentType.Container;
};
