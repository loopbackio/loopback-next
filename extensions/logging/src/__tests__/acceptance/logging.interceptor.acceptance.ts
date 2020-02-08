// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {extensionFor} from '@loopback/core';
import {
  get,
  HttpErrors,
  param,
  RestApplication,
  RestServerConfig,
} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {format, transports} from 'winston';
import {
  LoggingComponent,
  logInvocation,
  WinstonFormat,
  WinstonLogRecord,
  WINSTON_FORMAT,
  WINSTON_TRANSPORT,
} from '../..';
import {LoggingBindings} from '../../keys';

describe('Logging interceptor', () => {
  let app: RestApplication;
  let request: Client;
  let logs: WinstonLogRecord[] = [];

  class MyController {
    @get('/greet/{name}')
    @logInvocation()
    greet(@param.path.string('name') name: string) {
      if (name === 'invalid-name') {
        throw new HttpErrors.BadRequest('Invalid name');
      }
      return `Hello, ${name}`;
    }

    @get('/hello/{name}')
    hello(@param.path.string('name') name: string) {
      if (name === 'invalid-name') {
        throw new HttpErrors.BadRequest('Invalid name');
      }
      return `Hello, ${name}`;
    }
  }

  before(async () => {
    app = givenRestApplication();
    app.controller(MyController);
    logs = [];
    const myFormat: WinstonFormat = format((info, opts) => {
      logs.push(info);
      return false;
    })();
    app
      .bind('logging.winston.formats.myFormat')
      .to(myFormat)
      .apply(extensionFor(WINSTON_FORMAT));
    const consoleTransport = new transports.Console({
      level: 'verbose',
      format: myFormat,
    });
    app
      .bind('logging.winston.transports.console')
      .to(consoleTransport)
      .apply(extensionFor(WINSTON_TRANSPORT));
    app.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false,
    });
    app.component(LoggingComponent);
    await app.start();
    request = createRestAppClient(app);
  });

  after(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  beforeEach(() => {
    logs = [];
  });

  it('logs http req/res for /hello', async () => {
    await request.get('/hello/John').expect(200);
    expect(logs.length).to.equal(1);
    expect(logs[0].level).to.equal('info');
    expect(logs[0].message).to.match(/"GET \/hello\/John HTTP\/1.1" 200/);
  });

  it('logs error for http req/res for /hello', async () => {
    await request.get('/hello/invalid-name').expect(400);
    expect(logs.length).to.equal(1);
    expect(logs[0].level).to.equal('info');
    expect(logs[0].message).to.match(
      /"GET \/hello\/invalid-name HTTP\/1.1" 400/,
    );
  });

  it('logs http req/res for /greet', async () => {
    await request.get('/greet/John').expect(200);
    expect(logs.length).to.equal(3);
    expect(logs[0].level).to.equal('verbose');
    expect(logs[1].level).to.equal('verbose');
    expect(logs[2].level).to.equal('info');
    expect(logs[2].message).to.match(/"GET \/greet\/John HTTP\/1.1" 200/);
  });

  it('logs method invocation of greet()', async () => {
    await request.get('/greet/Jane').expect(200);
    expect(logs).to.containEql({
      level: 'verbose',
      message: "invoking MyController.prototype.greet with: [ 'Jane' ]",
    });
    expect(logs).to.containEql({
      level: 'verbose',
      message: 'returned from MyController.prototype.greet: Hello, Jane',
    });
  });

  it('logs method invocation error of greet()', async () => {
    await request.get('/greet/invalid-name').expect(400);
    expect(logs).to.containEql({
      level: 'verbose',
      message: "invoking MyController.prototype.greet with: [ 'invalid-name' ]",
    });
    expect(logs[1].level).to.eql('error');
    expect(logs[1].message).to.match(
      /error from MyController\.prototype\.greet/,
    );
    expect(logs[1].message).to.match(/BadRequestError\: Invalid name/);
  });

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }
});
