// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('../../lib/debug')('import-lb3-models');
const path = require('path');
const pEvent = require('p-event');

module.exports = {
  loadLb3App,
};

// TODO: do we want to share this code with `Lb3AppBooter.loadAndBootTheApp`?
async function loadLb3App(dir) {
  debug('Loading LB3 app from', dir);
  const lb3App = require(path.resolve(dir));

  debug(
    'If your LB3 app does not boot correctly then make sure it is using loopback-boot version 3.2.1 or higher.',
  );

  if (lb3App.booting) {
    debug('  waiting for boot process to finish');
    // Wait until the legacy LB3 app boots
    await pEvent(lb3App, 'booted');
  }
  return lb3App;
}
