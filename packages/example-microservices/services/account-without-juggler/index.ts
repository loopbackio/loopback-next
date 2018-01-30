import { Application } from '@loopback/core';
import { AccountController } from './controllers/AccountController';
import { AccountRepository } from './repositories/account';

class AccountMicroservice extends Application {
  private _startTime: Date;

  constructor() {
    super();

    const app = this;
    app.controller(AccountController);
    app.bind('http.port').to(3001);
    app.bind('repositories.account').toClass(AccountRepository);
  }

  async start() {
    this._startTime = new Date();
    return super.start();
  }

  async info() {
    const port: Number = await this.get('http.port');

    return {
      appName: "account-without-juggler",
      uptime: Date.now() - this._startTime.getTime(),
      url: 'http://127.0.0.1:' + port,
    };
  }
}

async function main(): Promise<void> {
  const app = new AccountMicroservice();
  await app.start();
  console.log('Application Info:', await app.info());
}

main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});
