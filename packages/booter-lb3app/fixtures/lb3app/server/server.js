'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = (module.exports = loopback());

boot(app, __dirname, function(err) {
  if (err) throw err;
});
