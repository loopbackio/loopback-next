'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = (module.exports = loopback());

app.get('/hello', (req, res) => {
  res.send('hello');
});

boot(app, __dirname, function(err) {
  if (err) throw err;
});
