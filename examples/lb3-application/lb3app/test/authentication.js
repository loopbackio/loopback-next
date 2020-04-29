// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const lb3App = require('../server/server');
const supertest = require('@loopback/testlab').supertest;
const assert = require('assert');
const ExpressServer = require('../../dist/server').ExpressServer;
require('should');

let app;

function request(verb, url) {
  // use the original app's server
  return supertest(app.server)
    [verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

describe('LoopBack 3 authentication', function () {
  before(async function () {
    app = new ExpressServer();
    await app.boot();
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  context('authentication', () => {
    let User;

    before(() => {
      User = lb3App.models.User;
    });

    it('creates a User and logs them in and out', function (done) {
      User.create({email: 'new@email.com', password: 'L00pBack!'}, function (
        err,
        user,
      ) {
        assert.equal(user.email, 'new@email.com');
        User.login(
          {
            email: 'new@email.com',
            password: 'L00pBack!',
          },
          function (err2, token) {
            token.should.have.properties('ttl', 'userId', 'created', 'id');
            assert.equal(token.userId, user.id);
            User.logout(token.id);
            User.deleteById(user.id);
          },
        );
        done();
      });
    });

    it('rejects anonymous requests to protected endpoints', function (done) {
      request('get', '/api/CoffeeShops/greet').expect(401, function (err, res) {
        assert.equal(res.body.error.code, 'AUTHORIZATION_REQUIRED');
      });
      done();
    });

    it('makes an authenticated request', function (done) {
      User.create({email: 'new@email.com', password: 'L00pBack!'}, function (
        err,
        user,
      ) {
        user.email.should.be.equal('new@email.com');
        User.login({email: 'new@email.com', password: 'L00pBack!'}, function (
          err2,
          token,
        ) {
          assert.equal(typeof token, 'object');
          assert.equal(token.userId, user.id);
          request(
            'get',
            `/api/CoffeeShops/greet?access_token=${token.id}`,
          ).expect(200, function (err3, res) {
            res.body.greeting.should.be.equal('Hello from this Coffee Shop');
            done();
          });
        });
      });
    });
  });
});
