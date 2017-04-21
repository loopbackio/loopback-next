var fs = require('fs');
var parser = require('url');
var pathRegexp = require('path-to-regexp');

var router = exports = module.exports = {};

router.stack = [];

router.route = function(path, method) {
  var layer = new Layer(path, {
      strict: false,
      end: false
    }, method);
  this.stack.push(layer);
}

router.get = function(url, method) {
  this.route(url, method);  
}

router.use = function(url, method) {
  this.route(url, method);  
}

router.handle = function handle(req, res, done) {
  var self = this;
  var idx = 0;
  var url = parser.parse(req.url, true);
  // middleware and routes
  var stack = self.stack;

  next();

  function next(err) {

    // find next matching layer
    var layer;
    var match;
    var route;

    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = layer.match(url.path);
      if (match !== true) {
        continue;
      }
      return layer.handle_request(req, res, next);
    }
    //done();
  }
}

var Layer = function (path, options, fn) {
  var opts = options || {};
  this.handle = fn;
  this.name = fn.name || '<anonymous>';
  this.regexp = pathRegexp(path, this.keys = [], opts);
  this.regexp.fast_star = path === '*'
  this.regexp.fast_slash = path === '/' && opts.end === false
}

Layer.prototype.handle_request = function handle(req, res, next) {
  var fn = this.handle;
  try {
    fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

Layer.prototype.match = function match(path) {
  var match = this.regexp.exec(path);  
  if (!match) {
    this.params = undefined;
    this.path = undefined;
    return false;
  }
  return true;
};
