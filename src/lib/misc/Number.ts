
interface Number {
    between(a: number, b: number): boolean;
    to$(): string;
    toCC(): string;
}

Object.defineProperties(Number.prototype, {
    between: {
        value(a: number, b: number): boolean {
            const min = Math.min.apply(Math, [a, b]);
            const max = Math.max.apply(Math, [a, b]);
            return this >= min && this <= max;
        }
    },
    to$: {
        value(): string {
            return `$${this.toLocaleString()}`;
        }
    }
});
