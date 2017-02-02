import http = require('http');
import bluebird = require('bluebird');
import { Container } from 'inversify';

export interface AppConfig {
  port : number;
}

export enum AppState {
  cold,
  starting,
  listening,
  crashed,
  stopped
}

export class Application extends Container {
  // get runtime to enforce AppConfig as AppConfig
  constructor(public config?: AppConfig) {
    super();
    if (config === undefined) {
      this.config = {port: 3000};
    }
  }

  public state: AppState = AppState.cold;

  async start() {
    this.state = AppState.starting;
    const server = http.createServer((req, res) => {
      res.end();
    });
    const listen = bluebird.promisify(server.listen, {context: server});
    await listen(this.config.port);
    this.state = AppState.listening;
  }
}