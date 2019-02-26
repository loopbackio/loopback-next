'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = (module.exports = loopback());

app.get('/hello', (req, res) => {
  res.send('hello');
});

boot(app, __dirname, function(err) {
  if (err) throw err;
});
