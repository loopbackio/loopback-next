import http = require('http');

import bluebird = require('bluebird');

export interface AppConfig {
  port : number;
}

export class Application {
  constructor(public config : AppConfig) {
    if (config === undefined) {
      this.config = {port: 3000};
    }
  }
  public start() : Promise<void> {
    let server = http.createServer((req, res) => {
      res.end();
    });
    let listen = bluebird.promisify(server.listen, {context: server});

    return listen(this.config.port);
  }
}