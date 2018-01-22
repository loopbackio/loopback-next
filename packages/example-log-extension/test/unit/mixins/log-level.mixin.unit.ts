// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {LogLevelMixin, LOG_LEVEL, EXAMPLE_LOG_BINDINGS} from '../../..';

describe('LogLevelMixin (unit)', () => {
  it('mixed class has .logLevel()', () => {
    const myApp = new AppWithLogLevel();
    expect(typeof myApp.logLevel).to.be.eql('function');
  });

  it('binds LogLevel from constructor', () => {
    const myApp = new AppWithLogLevel({
      logLevel: LOG_LEVEL.ERROR,
    });

    expectLogLevelToBeBound(myApp);
  });

  it('bind logLevel from app.logLevel()', () => {
    const myApp = new AppWithLogLevel();
    myApp.logLevel(LOG_LEVEL.ERROR);
    expectLogLevelToBeBound(myApp);
  });

  class AppWithLogLevel extends LogLevelMixin(Application) {}

  function expectLogLevelToBeBound(myApp: Application) {
    const logLevel = myApp.getSync(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL);
    expect(logLevel).to.be.eql(LOG_LEVEL.ERROR);
  }
});
