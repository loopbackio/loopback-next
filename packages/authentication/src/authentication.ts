// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import http = require('http');

/**
 * Authentication class to define the lifecycle of a passport strategy.
 * Instance is created by passing a passport strategy in the constructor
 */
export class Authentication {
  private strategyCtor: {};

  constructor(strategy) {
    this.strategyCtor = strategy;
  }

  /**
   * The function to invoke the contained passport strategy.
   *     1. Create an instance of the strategy
   *     2. add success and failure state handlers
   *     3. authenticate using the strategy
   * @param req {http.ServerRequest} The incoming request.
   * @param res {http.ServerResponse} The response object.
   * @param next {Function} callback for authentication.
   */
  authenticate(req, res, next) {
    // create an instance of the strategy
    const strategy = Object.create(this.strategyCtor);
    const self = this;

    // add logIn method to the incoming http request
    req.logIn = req.login = function(user, done) {
      this.user = user;
      done();
    };

    // add success state handler to strategy instance
    strategy.success = function(user, info) {
      req.login(user, next);
    };

    // add failure state handler to strategy instance
    strategy.fail = function(challenge, status) {
      self.reAuthenticate(res, challenge, status);
    };

    // add error state handler to strategy instance
    strategy.error = function(error) {
      next(error);
    };

    // authenticate
    strategy.authenticate(req);
  }

  /**
   * function to redirect for authentication to http client.
   */
  reAuthenticate(res, challenge, status) {
    res.statusCode = status || 401;
    if (res.statusCode === 401 && challenge) {
      res.setHeader('WWW-Authenticate', [challenge]);
    }
    res.end(http.STATUS_CODES[res.statusCode]);
  }
}
