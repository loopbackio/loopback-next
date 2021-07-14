// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const ExpressServer = require('../../dist/server').ExpressServer;
const CoffeeShopApp = require('../../dist/application').CoffeeShopApplication;
require('should');

let CoffeeShop, app;

describe('LoopBack 3 style integration tests - boot from LB4 app', function () {
  before(async function () {
    app = new CoffeeShopApp();
    await app.boot();
    await app.start();
    CoffeeShop = await app.get('lb3-models.CoffeeShop');
  });

  after(async () => {
    await CoffeeShop.destroyAll({name: 'Nook Shop'});
    await app.stop();
  });

  runTests();
});

describe('LoopBack 3 style integration tests - boot from express', function () {
  before(async () => {
    app = new ExpressServer();
    await app.boot();
    await app.start();
    CoffeeShop = await app.lbApp.get('lb3-models.CoffeeShop');
  });

  after(async () => {
    await app.stop();
  });

  runTests();
});

function runTests() {
  it('CoffeeShop.find', function (done) {
    CoffeeShop.find({where: {name: 'Bel Cafe'}}, function (err, shop) {
      shop[0].__data.name.should.be.equal('Bel Cafe');
      shop[0].__data.city.should.be.equal('Vancouver');
    });
    done();
  });

  it('CoffeeShop.count', function (done) {
    CoffeeShop.count({}, function (err, count) {
      assert.equal(count, 6);
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
}
