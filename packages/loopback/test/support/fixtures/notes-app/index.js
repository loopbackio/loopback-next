'use strict';

// JIT TS compilation
require('ts-node').register({
  fast: true,
  configFile: '../../../tsconfig.json'
});

// start application
const NoteApp = require('./app.ts').NoteApp;
const config = require('./app.json');
const app = new NoteApp(config);
app.start();

// export for testing
module.exports = app;