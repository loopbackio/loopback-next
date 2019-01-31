// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {LogMixin, LOG_LEVEL, EXAMPLE_LOG_BINDINGS} from '../../..';

describe('LogMixin (unit)', () => {
  let myApp: AppWithLogMixin;

  beforeEach(getApp);

  it('mixed class has .logLevel()', () => {
    expect(myApp.logLevel).to.be.a.Function();
  });

  it('binds LogLevel from constructor', () => {
    myApp = new AppWithLogMixin({
      logLevel: LOG_LEVEL.ERROR,
    });
    expectLogLevelToBeBound();
  });

  it('bind logLevel from app.logLevel()', () => {
    myApp.logLevel(LOG_LEVEL.ERROR);
    expectLogLevelToBeBound();
  });

  it('adds LogComponent to target class', () => {
    const boundComponent = myApp.find('components.*').map(b => b.key);
    expect(boundComponent).to.containEql('components.LogComponent');
  });

  class AppWithLogMixin extends LogMixin(Application) {}

  function expectLogLevelToBeBound() {
    const logLevel = myApp.getSync(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL);
    expect(logLevel).to.be.eql(LOG_LEVEL.ERROR);
  }

  function getApp() {
    myApp = new AppWithLogMixin();
  }
});
