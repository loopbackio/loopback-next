import { Application } from '@loopback/core';
import { AccountController } from './controllers/AccountManagementController';

class FacadeMicroservice extends Application {
  private _startTime: Date;

  constructor() {
    super();
    this.controller(AccountController);
  }

  async start() {
    this._startTime = new Date();
    return super.start();
  }

  async info() {
    const port: Number = await this.get('http.port');

    return {
      appName: "facade",
      uptime: Date.now() - this._startTime.getTime(),
      url: 'http://127.0.0.1:' + port,
    };
  }
}

async function main(): Promise<void> {
  const app = new FacadeMicroservice();
  await app.start();
  console.log('Application Info:', await app.info());
}

main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});
