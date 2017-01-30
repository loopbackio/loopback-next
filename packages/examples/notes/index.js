'use strict';

// JIT TS compilation
require('ts-node').register({
  fast: true,
  configFile: '../../../tsconfig.json'
});

// start application
const NoteApp = require('./app.ts').NoteApp;
const config = require('./app.json');


let app = new NoteApp(config);

app
  .start()
  .then(() => {
    console.log('listening on http://localhost:' + app.config.port);
  });