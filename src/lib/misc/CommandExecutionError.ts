export class CommandExecutionError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "CommandExecutionError";

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CommandExecutionError.prototype);
  }
}