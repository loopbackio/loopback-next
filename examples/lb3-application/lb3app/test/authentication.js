// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const lb3App = require('../server/server');
const {supertest} = require('@loopback/testlab');
const assert = require('assert');
const {ExpressServer} = require('../../dist/server');
const {CoffeeShopApplication} = require('../../dist/application');
require('should');

let app, User;

function jsonForLB4(verb, url) {
  // use the lb4 app's rest server
  return supertest(app.restServer.url)
    [verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

function jsonForExpressApp(verb, url) {
  // use the express server, it mounts apis to base path '/api'
  return supertest(app.server)
    [verb]('/api' + url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

/**
 * The tests show running LoopBack 3 authentication tests mounted to
 * an Express server.
 * Make sure you start the express server first and stop it after tests done.
 */
describe('LoopBack 3 authentication - Express server', function () {
  before(async function () {
    User = lb3App.models.User;
    app = new ExpressServer();
    await app.boot();
    await app.start();
  });

  after(async () => {
    await User.destroyAll();
    await app.stop();
  });

  runTests(jsonForExpressApp);
});

/**
 * The tests show running LoopBack 3 authentication tests mounted to
 * a LoopBack 4 application.
 * Make sure you start the LoopBack 4 application first and stop it
 * after tests done.
 */
describe('Loopback 3 authentication - LoopBack 4 app', function () {
  before(async function () {
    User = lb3App.models.User;
    app = new CoffeeShopApplication();
    await app.boot();
    await app.start();
  });

  after(async () => {
    await User.destroyAll();
    await app.stop();
  });

  runTests(jsonForLB4);
});

function runTests(request) {
  it('creates a User and logs them in and out', function (done) {
    // create user
    request('post', '/users')
      .send({email: 'new@email.com', password: 'L00pBack!'})
      .expect(200, function (err, user) {
        assert.equal(user.body.email, 'new@email.com');
        // login
        request('post', '/users/login')
          .send({
            email: 'new@email.com',
            password: 'L00pBack!',
          })
          .expect(200, function (err2, token) {
            token.body.should.have.properties('ttl', 'userId', 'created', 'id');
            assert.equal(token.body.userId, user.body.id);
            // logout
            request(
              'post',
              `/users/logout?access_token=${token.body.id}`,
            ).expect(204);
            done();
          });
      });
  });

  it('rejects anonymous requests to protected endpoints', function (done) {
    request('get', '/CoffeeShops/greet').expect(401, function (err, res) {
      assert.equal(res.body.error.code, 'AUTHORIZATION_REQUIRED');
    });
    done();
  });

  it('makes an authenticated request', function (done) {
    // create user
    User.create(
      {email: 'new@gmail.com', password: 'L00pBack!'},
      function (err, user) {
        user.email.should.be.equal('new@gmail.com');
        // login
        User.login(
          {email: 'new@gmail.com', password: 'L00pBack!'},
          function (err2, token) {
            assert.equal(typeof token, 'object');
            assert.equal(token.userId, user.id);
            // authenticate user with token
            request(
              'get',
              `/CoffeeShops/greet?access_token=${token.id}`,
            ).expect(200, function (err3, res) {
              res.body.greeting.should.be.equal('Hello from this Coffee Shop');
              done();
            });
          },
        );
      },
    );
  });
}
