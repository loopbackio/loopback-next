'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = (module.exports = loopback());

app.dataSource('memory', {connector: 'memory'});
const Color = app.registry.createModel('Color', {name: String});
app.model(Color, {dataSource: 'memory'});

app.get('/hello', (req, res) => {
  res.send('hello');
});

boot(app, __dirname, function(err) {
  if (err) throw err;
});
