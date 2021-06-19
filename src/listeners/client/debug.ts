import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
  constructor() {
    super('debug', {
      emitter: 'client',
      event: 'debug',
    });
  }

  public exec(debug: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.client.logger.debug(debug);
    }
  }
}
