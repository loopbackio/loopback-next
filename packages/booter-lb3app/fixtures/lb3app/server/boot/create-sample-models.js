// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = function (app) {
  app.dataSources.db.automigrate('CoffeeShop', function (err) {
    if (err) throw err;

    app.models.CoffeeShop.create(
      [
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
      ],
      function (err2, coffeeShops) {
        if (err2) throw err2;
      },
    );
  });
};
