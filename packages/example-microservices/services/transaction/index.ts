// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {TransactionController} from './controllers/TransactionController';

class TransactionApplication extends Application {
  private _startTime: Date;

  constructor() {
    super();
    const app = this;
    app.controller(TransactionController);
    app.bind('http.port').to(3003);
  }

  async start() {
    this._startTime = new Date();
    return super.start();
  }

  async info() {
    const port: Number = await this.get('http.port');

    return {
      appName: 'transaction',
      uptime: Date.now() - this._startTime.getTime(),
      url: 'http://127.0.0.1:' + port,
    };
  }
}

async function main(): Promise<void> {
  const app = new TransactionApplication();
  await app.start();
  console.log('Application Info:', await app.info());
}

main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});
