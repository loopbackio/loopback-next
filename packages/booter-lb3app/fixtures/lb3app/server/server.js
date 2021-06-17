// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = (module.exports = loopback());

boot(app, __dirname, function (err) {
  if (err) throw err;
});
