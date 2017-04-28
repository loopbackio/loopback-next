// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {Authentication} from '../../src/authentication';
import {BasicStrategy} from 'passport-http';
const http = require('http');

describe('Authentication', () => {
  let passport;
  let strategy;
  let req;
  let res;

  describe('Basic Strategy', () => {
    beforeEach(createBasicStrategy);
    beforeEach(createPassport);
    beforeEach(createMockHttpObjects);

    it('authenticates successfully for correct credentials', () => {
      const credential = 'simpson' + ':' + 'alpha';
      const hash = new Buffer(credential).toString('base64');
      req.headers.authorization = 'Basic ' + hash;
      passport.authenticate(req, res, function done(err) {
        expect(err).to.be.undefined;
        expect(req.user.role).to.equal('admin');
      });
    });

    it('returns error for invalid credentials', () => {
      const credential = 'Flintstone' + ':' + 'invalid';
      const hash = new Buffer(credential).toString('base64');
      req.headers.authorization = 'Basic ' + hash;
      passport.authenticate(req, res, function done(err) {
        expect(err).to.equal('Incorrect password');
      });
    });

    it('sets authentication header for reAuthentication', () => {
      const credential = 'George1' + ':' + 'gamma';
      const hash = new Buffer(credential).toString('base64');
      req.headers.authorization = 'Basic ' + hash;
      passport.authenticate(req, res);
      expect(res.headers).to.have.property('WWW-Authenticate');
    });
  });

  function createPassport() {
    passport = new Authentication(strategy);
  }

  function createMockHttpObjects() {
    req = {headers: {authorization: {}}, user: {role: {}}};
    res = Object.create(http.ServerResponse.prototype);
    res.headers = {};
    res.setHeader = function(key, value) {
      res.headers[key] = value;
    };
    res.end = function() {}; // do nothing for response connection
  }

  function createBasicStrategy() {
    const findUser = function(userId, password, done) {
      const userList = [
        {id: 'Simpson', password: 'alpha', role: 'admin'},
        {id: 'Flintstone', password: 'beta', role: 'builder'},
        {id: 'George', password: 'gamma', role: 'engineer'},
      ];

      const user = userList.find(function(item) {
        return item.id.toLowerCase() === userId.toLowerCase();
      });

      if (!user) {
        return done(null, false, 'reAuthenticate');
      }
      if (!(user.password === password)) {
        return done('Incorrect password');
      }
      return done(null, {role: user.role});
    };

    strategy = new BasicStrategy(
      function(userid, password, done) {
        return findUser(userid, password, done);
     });
  }
});
