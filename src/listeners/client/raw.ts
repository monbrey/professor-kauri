import { Listener } from "discord-akairo";

export default class RawListener extends Listener {
  [index: string]: any;

  constructor() {
    super("raw", {
      emitter: "client",
      event: "raw"
    });
  }

  public async exec(data: any) {
    const eventName = data.t;
    const eventData = data.d;

    // console.log(eventName);
  }
}
