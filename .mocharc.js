// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Reuse the mocha config from `@loopback/cli`
const config = require('./packages/cli/.mocharc.js');

// Set max listeners to 16 for testing to avoid the following warning:
// (node:11220) MaxListenersExceededWarning: Possible EventEmitter
// memory leak detected. 11 SIGTERM listeners added to [process].
// Use emitter.setMaxListeners() to increase limit
// It only happens when multiple app instances are started but not stopped
process.setMaxListeners(16);

module.exports = config;
