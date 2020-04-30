// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const {supertest} = require('@loopback/testlab');
const assert = require('assert');
const {ExpressServer} = require('../../dist/server');
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

describe('LoopBack 3 style acceptance tests', function () {
  before(async function () {
    app = new ExpressServer();
    await app.boot();
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  context('basic REST calls for LoopBack 3 application', () => {
    it('creates and finds a CoffeeShop', function (done) {
      request('post', '/api/CoffeeShops')
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
      request('get', '/api/CoffeeShops/status').expect(200, function (
        err,
        res,
      ) {
        res.body.status.should.be.equalOneOf(
          'We are open for business.',
          'Sorry, we are closed. Open daily from 6am to 8pm.',
        );
        done();
      });
    });

    it('gets external route in application', function (done) {
      request('get', '/ping').expect(200, function (err, res) {
        assert.equal(res.text, 'pong');
        done();
      });
    });
  });
});
