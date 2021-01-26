interface InteractionOption { name: string; options: Record<string, any>; value: any }

export const argMapper = (options: any) => {
  return new Map(options.map(
    (o: InteractionOption) => [o.name, o.value ? o.value : argMapper(o.options)]));
};