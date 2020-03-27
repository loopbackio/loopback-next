// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 *  Mock Authorization Server:
 *           mocks the authorization flow with a social app login like facebook, google, etc
 *
 *  Endpoints :
 *        `/oauth/dialog` -  opens the oauth2 flow, redirects to login page
 *        `/login` - loads the login page
 *        `/login_submit` - submit username , password
 *        `/oauth/token` - returns a token in exchange for a valid authorization code
 *        `/verify` - verifies token
 */

'use strict';

import express from 'express';
import {Server} from 'http';
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const _ = require('lodash');
import {MyUser} from './user-repository';

const app = express();
let server: Server;

// to support json payload in body
app.use('parse', bodyParser.json());
// to support html form bodies
app.use(bodyParser.text({type: 'text/html'}));
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({extended: false});

interface JWT {
  payload: {
    jti: string;
    client_id: string;
  };
}

/**
 * datastructure for an app registration, also holds issued tokens for an app
 */
interface App {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  client_secret: string;
  tokens: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

/**
 * list of registered apps for this oauth2 provider identified by their client ids
 */
interface AppRegistry {
  [clientId: string]: App;
}

/**
 * apps registered with this provider
 * format:
 *   { clientId: {client_secret, list_of_tokens} }
 */
const registeredApps: AppRegistry = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  '1111': {client_secret: 'app1_secret', tokens: {}},
  // eslint-disable-next-line @typescript-eslint/camelcase
  '2222': {client_secret: 'app2_secret', tokens: {}},
};

/**
 * user registry
 */
const users = [
  {
    id: 1001,
    username: 'user1',
    password: 'abc',
    email: 'usr1@lb.com',
    signingKey: 'AZeb==',
  },
  {
    id: 1002,
    username: 'user2',
    password: 'xyz',
    email: 'usr2@lb2.com',
    signingKey: 'BuIx=+',
  },
];

/**
 * find a user by a name and password
 * @param {*} username
 * @param {*} password
 */
function findUser(username: string, password: string) {
  const usr = _.filter(
    users,
    (user: MyUser) => user.username === username && user.password === password,
  );
  if (usr.length > 0) return usr[0];
  return null;
}

/**
 * create a jwt token
 * @param {*} user
 * @param {*} scopes
 * @param {*} signingKey
 */
async function createJwt(
  user: MyUser,
  scopes: string,
  signingKey: string,
  clientId: string,
) {
  const jti = Math.floor(Math.random() * Math.floor(1000));
  const token = await jwt.sign(
    {
      jti: jti,
      sub: user.id,
      name: user.username,
      email: user.email,
      iss: 'sample oauth provider',
      exp: Math.floor(Date.now() / 1000) + 5 * 1000,
      iat: Math.floor(Date.now() / 1000),
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: 'auth code',
      scopes: scopes,
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id: clientId,
    },
    signingKey,
  );
  return {token: token, id: jti};
}

/**
 * verify token
 *
 * check with given client id and token if token is valid
 *
 * @param {*} req
 * @param {*} token
 */
async function verifyToken(token: string) {
  const unwrappedJwt: JWT = jwt.decode(token, {json: true, complete: true});
  const tokenId: string = unwrappedJwt.payload.jti;
  const registeredApp: App = registeredApps[unwrappedJwt.payload.client_id];
  if (registeredApp) {
    const result = await jwt.verify(token, registeredApp[tokenId].signingKey);
    if (result) {
      return result;
    } else {
      throw new Error('invalid token');
    }
  } else {
    throw new Error('invalid app');
  }
}

/**
 * Endpoint: GET /oauth/dialog
 * Begins the authorization code flow
 *
 * @params: redirect_uri, client_id
 * passport-oauth2 takes care of sending the configured `callBackURL` setting as `redirect_uri`
 *
 * 1. validates if client_id is registered
 * 2. redirects to login page if the client_id is registered
 * 3. returns error if client_id is not registered
 */
app.get('/oauth/dialog', function (req, res) {
  if (!req.query.redirect_uri) {
    res.setHeader('Content-Type', 'application/json');
    res
      .status(500)
      .send(JSON.stringify({error: 'redirect_uri not sent in query'}));
    return;
  }
  if (registeredApps[req.query.client_id]) {
    let params =
      '?client_id=' +
      req.query.client_id +
      '&&redirect_uri=' +
      req.query.redirect_uri;
    params = params + '&&scope=' + req.query.scope;
    res.redirect('/login' + params);
  } else {
    res.send('invalid app');
  }
});

/**
 * login page
 *
 * handles login part of the authorization call
 */
app.get('/login', function (req, response) {
  response.setHeader('Content-Type', 'text/html');
  response.write('<html><body>');
  response.write("<form action='login_submit' method=post >");
  // client_id and redirect_uri are stored as hidden variables
  // for the provider to redirect on successful login
  response.write(
    '<input type="hidden" name=redirect_uri value="' +
      req.query.redirect_uri +
      '" />',
  );
  response.write(
    '<input type="hidden" name=client_id value="' +
      req.query.client_id +
      '" />',
  );
  response.write(
    '<input type=text name=scope value="' + req.query.scope + '" />',
  );
  response.write('<input type=text name=username />');
  response.write('<input type=text name=password />');
  response.write('<button type="submit">Login</button>');
  response.write('</body></html>');
  response.end();
});

/**
 * login form submit
 * handles callback part of the authorization call
 *
 * 1. creates access code
 * 2. generates token
 * 3. stores token
 * 4. redirects to callback url with access code
 */
app.post('/login_submit', urlencodedParser, async function (req, res) {
  const user = findUser(req.body.username, req.body.password);
  if (user) {
    // get registered app
    const registeredApp = registeredApps[req.body.client_id];
    // generate access code
    const authCode = Math.floor(Math.random() * Math.floor(1000));
    // create a token for the access code
    const result = await createJwt(
      user,
      req.body.scope,
      user.signingKey,
      req.body.client_id,
    );
    // store generated token
    registeredApp.tokens[authCode] = {token: result.token};
    registeredApp[result.id] = {signingKey: user.signingKey, code: authCode};
    // redirect to call back url with the access code
    let params = '?client_id=' + req.body.client_id;
    params = params + '&&code=' + authCode;
    res.redirect(req.body.redirect_uri + params);
  } else {
    res.sendStatus(401);
  }
});

/**
 * Endpoint: POST '/oauth/token'
 * Returns: token
 *
 * returns token in exchange for access code
 */
app.post('/oauth/token', urlencodedParser, function (req, res) {
  if (registeredApps[req.body.client_id]) {
    //&& apps[req.query.client_id].client_secret === req.query.client_secret
    const oauthstates = registeredApps[req.body.client_id].tokens;
    if (oauthstates[req.body.code]) {
      res.setHeader('Content-Type', 'application/json');
      // eslint-disable-next-line @typescript-eslint/camelcase
      res.send({access_token: oauthstates[req.body.code].token});
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

/**
 * Endpoint: GET '/oauth/token'
 * Returns: token
 *
 * returns token in exchange for access code
 */
app.get('/oauth/token', function (req, res) {
  if (registeredApps[req.query.client_id]) {
    //&& apps[req.query.client_id].client_secret === req.query.client_secret
    const oauthstates = registeredApps[req.query.client_id].tokens;
    if (oauthstates[req.query.code]) {
      res.setHeader('Content-Type', 'application/json');
      // eslint-disable-next-line @typescript-eslint/camelcase
      res.send({access_token: oauthstates[req.query.code].token});
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

/**
 * Endpoint: '/verify'
 * Returns: user profile
 *
 * Verifies token and returns user profile
 */
app.get('/verify', async function (req, res) {
  try {
    const token = req.query.access_token || req.header('Authorization');
    const result = await verifyToken(token);
    const expirationTime = result.exp;
    res.setHeader('Content-Type', 'application/json');
    res.send({...result, expirationTime: expirationTime});
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(401).send(JSON.stringify({error: err}));
  }
});

export function startApp() {
  server = app.listen(9000);
}

export function stopApp() {
  server.close();
}
