// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function (app) {
  // Install a "/coffee" route that returns "shop"
  app.get('/coffee', function (req, res) {
    res.send('shop');
  });
};
