var http = require('http');
var router = require('./mock-express-router');
var expressResponse = require('./mock-express-response');
var flatten = require('array-flatten');
var slice = Array.prototype.slice;

module.exports = function createApplication() {
  return app;
};

var app = function(req, res, next) {
  app.handle(req, res, next);
}

app._router = router;

app.handle = function (req, res, callback) {
  var router = this._router;
  var response = mixinProperties(res, expressResponse);
  router.handle(req, response, callback);
};

app.listen = function listen() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

app.use = function use(arg) {
  var fnList;

  var defaultPath = '/';
  var router = this._router;

  var offset = 0;

  if (typeof arg === 'function') {
    fnList = arg;
    arg = defaultPath;
  } else if (typeof arg !== 'function') {
    offset = 1;
    fnList = flatten(slice.call(arguments, offset));
  }

  if (typeof fnList === 'function') {
    fnList = [fnList];
  }

  fnList.forEach(function (fn) {
    router.use(arg, fn);
  });

  return this;
};

app.get = function (arg) {
  var arg, fnList;

  var defaultPath = '/';
  var router = this._router;

  var offset = 0;

  if (typeof arg === 'function') {
    fnList = [arg];
    arg = defaultPath;
  } else if (typeof arg !== 'function') {
    offset = 1;
  }

  fnList = flatten(slice.call(arguments, offset));

  if (typeof fnList === 'function') {
    fnList = [fnList];
  }

  fnList.forEach(function (fn) {
    router.use(arg, fn);
  });

  return this;
};

function mixinProperties(obj, proto) {
	for (var prop in proto) {
		if (!obj.hasOwnProperty(prop)) {
			obj[prop] = proto[prop];
		}
	}
	return obj;
}
