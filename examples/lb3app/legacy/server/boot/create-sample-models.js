'use strict';

const debug = require('debug')('loopback:example:lb3app');

module.exports = function(app, cb) {
  app.dataSources.mysqlDs.automigrate('CoffeeShop', function(err) {
    if (err) throw err;

    app.models.CoffeeShop.create([{
      name: 'Bel Cafe',
      city: 'Vancouver',
    }, {
      name: 'Three Bees Coffee House',
      city: 'San Mateo',
    }, {
      name: 'Caffe Artigiano',
      city: 'Vancouver',
    }], function(err, coffeeShops) {
      if (err) return cb(err);
      debug('Models created: \n', coffeeShops);
      cb();
    });
  });
};
