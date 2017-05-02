import {Application, Server, ParameterObject} from '../../../../loopback';
import {StrategyAdapter} from '../../../src/strategy-adapter';
import {api, inject} from '../../../../loopback';
import {givenOpenApiSpec} from '@loopback/openapi-spec-builder';

const Strategy = require('passport-http').BasicStrategy;

const USERS = {
  joe : {username: 'joe', password: '12345'}
};

@api({
  basePath: '/',
  paths: {
    '/who-am-i': {
      get: {
        'x-operation-name': 'whoAmI',
        responses: {
          '200': {
            type: 'string'
          }
        }
      }
    }
  }
})
export class MyController {
  public whoAmI() : string {
    console.log('whoAmI');
    return 'joe';
  }
}

class AuthAcceptance extends Application {
  private _startTime: Date;

  constructor() {
    super();
    const app = this;
    //app.controller(MyController);
    app.bind('servers.http.enabled').to(true);
    app.bind('servers.https.enabled').to(true);
    var basicAthStrategy = new Strategy(this.verify);
    app.bind('authentication.strategy').to(basicAthStrategy);
  }

  async start() {
    this._startTime = new Date();
    const server = new Server({port: 3001});
    server.bind('applications.accounts').to(this);
    return server.start();
  }

  //callback method get called from BasicStrategy(passport-http code)
  verify(username: string, password: string, cb: any) {
    console.log('Verifying username, password %s %s', username, password);
    const user = USERS.joe;
    if (!user) { return cb(null, false); }
    if (user.password != password) { return cb(null, false); }
    return cb(null, user);
  }

  info() {
    const uptime = Date.now() - this._startTime.getTime();
    return {uptime: uptime};
  }  
}

main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});

async function main(): Promise<void> {
  console.log('main called');
  const app = new AuthAcceptance();
  await app.start();
  console.log('app.start called');
  console.log('Application Info:', app.info());
}
