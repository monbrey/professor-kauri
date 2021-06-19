interface String {
  toTitleCase(): string;
}

Object.defineProperties(String.prototype, {
  toTitleCase: {
    value(): string {
      return this.replace(/\w\S*/g, (s: string) => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
    },
  },
});
