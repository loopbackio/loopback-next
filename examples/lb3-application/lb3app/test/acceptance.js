// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const {supertest} = require('@loopback/testlab');
const assert = require('assert');
const {ExpressServer} = require('../../dist/server');
const {CoffeeShopApplication} = require('../../dist/application');
require('should');

let app;

function jsonForLB4(verb, url) {
  // use the lb4 app's rest server
  return supertest(app.restServer.url)
    [verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

function jsonForExpressApp(verb, url) {
  // use the express server, it mounts LoopBack 3 apis to
  // base path '/api'
  return supertest(app.server)
    [verb]('/api' + url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

function jsonForExternal(verb, url) {
  // use the express server, its external apis doesn't have base path
  return supertest(app.server)
    [verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

describe('LoopBack 3 style acceptance tests - boot from Express server', function () {
  before(async function () {
    app = new ExpressServer();
    await app.boot();
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  it('gets external route in application', function (done) {
    jsonForExternal('get', '/ping').expect(200, function (err, res) {
      assert.equal(res.text, 'pong');
      done();
    });
  });

  runTests(jsonForExpressApp);
});

describe('LoopBack 3 style acceptance tests - boot from LB4 app', function () {
  before(async function () {
    app = new CoffeeShopApplication();
    await app.boot();
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  runTests(jsonForLB4);
});

function runTests(request) {
  context('basic REST calls for LoopBack 3 application', () => {
    it('creates and finds a CoffeeShop', function (done) {
      request('post', '/CoffeeShops')
        .send({
          name: 'Coffee Shop',
          city: 'Toronto',
        })
        .expect(200)
        .end(function (err, res) {
          assert(typeof res.body === 'object');
          assert(res.body.name);
          assert(res.body.city);
          assert.equal(res.body.name, 'Coffee Shop');
          assert.equal(res.body.city, 'Toronto');
          done();
        });
    });

    it("gets the CoffeeShop's status", function (done) {
      request('get', '/CoffeeShops/status').expect(200, function (err, res) {
        res.body.status.should.be.equalOneOf(
          'We are open for business.',
          'Sorry, we are closed. Open daily from 6am to 8pm.',
        );
        done();
      });
    });
  });
}
