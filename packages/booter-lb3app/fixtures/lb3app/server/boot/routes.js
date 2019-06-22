module.exports = function(app) {
  // Install a "/coffee" route that returns "shop"
  app.get('/coffee', function(req, res) {
    res.send('shop');
  });
};
