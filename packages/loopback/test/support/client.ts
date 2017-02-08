// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Application, AppConfig } from 'loopback';
import bluebird = require('bluebird');
import request = require('request-promise');

export class Client {
  constructor(public app : Application) {

  }

  public async get(path : string) : Promise<Client.Result> {
    const url = 'http://localhost:' + this.app.config.port + path;
    const options = {
      uri: url,
      resolveWithFullResponse: true,
    } as any;

    const response = await request(options);
    return {
      status: response.statusCode,
    };
  }
}

export module Client {
  export interface Result {
    status : number;
  }
}
