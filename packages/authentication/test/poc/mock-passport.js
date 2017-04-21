var http = require('http');

class ExpressAdapter {
  constructor() { 
    this.authentication = new Authentication();
  }

  initialize() {
    return function(req, res, next) {
      next();
    }
  }

  use(strategy) {
    this.authentication.setStrategy(strategy);
  }

  authenticate() {
    return this.authentication.authenticate.bind(this.authentication);
  }
};

class Authentication {
  constructor() {}

  setStrategy(strategy) {
    this.strategyCtor = strategy;
  }

  authenticate(req, res, next) {
    var strategy = Object.create(this.strategyCtor);
    var self = this;
    req.logIn = req.login = function(user, done) {
      this.user = user;
      done();
    }
    strategy.success = function(user, info) {
      req.login(user, next);
    }
    strategy.fail = function(challenge, status) {
      self.reAuthenticate(res, challenge, status);
    }
    strategy.authenticate(req);
  }

  reAuthenticate(res, challenge, status) {
    res.statusCode = status || 401;
    if (res.statusCode == 401 && challenge) {
      res.setHeader('WWW-Authenticate', [challenge]);
    }
    res.end(http.STATUS_CODES[res.statusCode]);
  }
}

module.exports = new ExpressAdapter();
