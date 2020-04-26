// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const should = require('should');
const ExpressServer = require('../../dist/server').ExpressServer;

describe('LoopBack 3 style integration tests', function () {
  let app;
  let CoffeeShop;

  before(async function () {
    app = new ExpressServer();
    await app.boot();
    await app.start();
  });

  before(() => {
    CoffeeShop = app.lbApp.getValueOrPromise('models.lb3-CoffeeShop');
  });

  after(async () => {
    await app.stop();
  });

  it('CoffeeShop.find', function (done) {
    CoffeeShop.find({where: {name: 'Bel Cafe'}}, function (err, shop) {
      shop[0].__data.name.should.be.equal('Bel Cafe');
      shop[0].__data.city.should.be.equal('Vancouver');
    });
    done();
  });

  it('CoffeeShop.count', function (done) {
    CoffeeShop.count({}, function (err, count) {
      assert(count, 3);
    });
    done();
  });

  it('CoffeeShop.create', function (done) {
    CoffeeShop.create(
      {
        name: 'Nook Shop',
        city: 'Toronto',
      },
      function (err, shop) {
        shop.__data.name.should.be.equal('Nook Shop');
        shop.__data.city.should.be.equal('Toronto');
      },
    );
    done();
  });
});
