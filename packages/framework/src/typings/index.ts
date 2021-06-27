export type Constructor<T> = new (...args: any[]) => T;
export type Extended<T> = { prototype: any } & T;
