declare module 'mongoose-timestamp';

type FunctionTypes<T> = { [K in keyof T]: T[K] extends (...args: any[]) => unknown ? K : never }[keyof T];
