// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('debug')('loopback:example:lb3application');

module.exports = async function (app) {
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
