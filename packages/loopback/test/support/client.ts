import { Application, AppConfig } from 'loopback';
import bluebird = require('bluebird');
import request = require('request-promise');

export class Client {
  constructor(public app : Application) {

  }

  public get(path : string) : Promise<Result>{
    const url = 'http://localhost:' + this.app.config.port + path;
    let options = {
      uri: url,
      resolveWithFullResponse: true
    } as any;

    return request(options)
      .then((response) => {
        return {
          statusCode: response.statusCode
        };
      });
  }
}

interface Result {
  status : number;
}