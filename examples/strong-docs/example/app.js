var config = {
  title: 'strong-docs',
  version: '0.0.1',
  content: '../',
};

var docs = require('../')(config);
var express = require('express');
var app = express();

app.get('/', function(req, res, next) {
  res.render('./template.ejs', {
    docs: docs,
  });
});
