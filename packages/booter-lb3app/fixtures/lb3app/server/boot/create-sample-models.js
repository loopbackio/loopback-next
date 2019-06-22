'use strict';

module.exports = function(app) {
  app.dataSources.db.automigrate('CoffeeShop', function(err) {
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
      function(err2, coffeeShops) {
        if (err2) throw err2;
      },
    );
  });
};
