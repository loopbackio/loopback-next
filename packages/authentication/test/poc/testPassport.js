const passport = require('./mock-passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const express = require('./mock-express');
const app = express();

app.use(passport.initialize());

passport.use(new BasicStrategy(
  function(userid, password, done) {
    return findUser(userid, password, done);
  }
));

app.get('/private', 
  passport.authenticate('basic', { session: false }),
  function(req, res) {
    res.json(req.user);
  });


app.listen(3000);

var findUser = function (userId, password, done) {
  var user = userList.find(function(user) {
    return user.id.toLowerCase() === userId.toLowerCase();
  });
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }
  if (!(user.password === password)) {
    return done(null, false, { message: 'Incorrect password.' });
  }
  return done(null, {role: user.role});
};

var userList = [
  {id: "Simpson", password: "alpha", role: "admin"},
  {id: "Flintstone", password: "beta", role: "builder"},
  {id: "George", password: "gamma", role: "engineer"}
];
