'use strict';

const debug = require('debug')('loopback:example:lb3application');

module.exports = async function(app) {
  await app.dataSources.db.automigrate('CoffeeShop');

  const coffeeShops = await app.models.CoffeeShop.create([
    {
      name: 'Bel Cafe',
      city: 'Vancouver',
    },
    {
      name: 'Three Bees Coffee House',
      city: 'San Mateo',
    },
    {
      name: 'Caffe Artigiano',
      city: 'Vancouver',
    },
  ]);
  debug('Models created: \n', coffeeShops);
};
