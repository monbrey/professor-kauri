import { Listener } from 'discord-akairo';

export default class RawListener extends Listener {
  [index: string]: any;

  constructor() {
    super('raw', {
      emitter: 'client',
      event: 'raw',
    });
  }

  public exec(data: any): Awaited<void> {
    if (process.env.NODE_ENV === 'development') {
      const eventName = data.t;
      const eventData = data.d;

      console.log(eventName, eventData);
    }
  }
}
