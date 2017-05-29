var http = require('http');
var mimeTypes = require('./mime-types');
var res = Object.create(http.ServerResponse.prototype);

var exts = {};
Object.keys(mimeTypes).forEach(function(key) {
  var extArray = mimeTypes[key];
  extArray.forEach(function(ext) {
    exts[ext] = key;
  });
});

res.type = function(t) {
  return this.setHeader('Content-Type', exts[t]);
}

res.send = function send(body) {
  var chunk = body;
  var encoding;
  var len;
  var type;

  switch (typeof chunk) {
    // string defaulting to html
    case 'string':
      if (!this.getHeader('Content-Type')) {
        this.type('html');
      }
      break;
    case 'boolean':
    case 'number':
    case 'object':
      if (chunk === null) {
        chunk = '';
      } else if (Buffer.isBuffer(chunk)) {
        if (!this.getHeader('Content-Type')) {
          this.type('bin');
        }
      } else {
        return this.json(chunk);
      }
      break;
  }

  // populate Content-Length
  if (chunk !== undefined) {
    if (!Buffer.isBuffer(chunk)) {
      // convert chunk to Buffer; saves later double conversions
      chunk = new Buffer(chunk, encoding);
      encoding = undefined;
    }

    len = chunk.length;
    this.setHeader('Content-Length', len);
  }

  this.end(chunk, encoding);

  return this;
};


res.json = function json(obj) {
  var body = JSON.stringify(obj);
  if (!this.getHeader('Content-Type')) {
    this.setHeader('Content-Type', 'application/json');
  }
  return this.send(body);
}

module.exports = res;
