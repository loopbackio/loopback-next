// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/mock-oauth2-provider
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

import bodyParser from 'body-parser';
import express, {Request, RequestHandler, Response} from 'express';
import {Server} from 'http';
import jwt from 'jsonwebtoken';
import {MyUser} from './user-repository';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Adapt an async handler so that rejections are passed to Express instead of
 * becoming unhandled promise rejections.
 */
function asyncHandler(
  handler: (req: Request, res: Response) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

/**
 * Hosts this mock provider is willing to redirect back to.
 *
 * A real authorization server matches `redirect_uri` against the callback urls
 * registered for the client. This provider only ever serves test applications
 * running on the same machine, so it accepts loopback hosts instead of
 * redirecting wherever the request asks.
 */
const ALLOWED_REDIRECT_HOSTS = ['localhost', '127.0.0.1', '::1'];

/**
 * Parse `redirect_uri` and return it only when it points at a local test app.
 * @param redirectUri - The `redirect_uri` taken from the request
 */
function parseRedirectUri(redirectUri: string) {
  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    return undefined;
  }
  const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
  // `URL` keeps IPv6 hosts in brackets
  const host = url.hostname.replace(/^\[|]$/g, '');
  return isHttp && ALLOWED_REDIRECT_HOSTS.includes(host) ? url : undefined;
}

const app = express();
let server: Server;

// to support json payload in body
app.use(bodyParser.json());
// to support html form bodies
app.use(bodyParser.text({type: 'text/html'}));
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({extended: false});

/**
 * data structure for an app registration, also holds issued tokens for an app
 *
 * The maps are keyed by values taken from the request, so they are `Map`s
 * rather than plain objects - a `__proto__` key would otherwise reach
 * `Object.prototype`.
 */
interface App {
  client_secret: string;
  /**
   * access tokens issued for this app, keyed by the access code handed to the
   * client
   */
  tokens: Map<string, {token: string}>;
  /**
   * signing key of each issued token, keyed by the token's `jti` claim
   */
  issuedTokens: Map<string, {signingKey: string; code: number}>;
}

/**
 * apps registered with this provider, keyed by their client ids
 */
const registeredApps = new Map<string, App>([
  [
    '1111',
    {client_secret: 'app1_secret', tokens: new Map(), issuedTokens: new Map()},
  ],
  [
    '2222',
    {client_secret: 'app2_secret', tokens: new Map(), issuedTokens: new Map()},
  ],
]);

/**
 * user registry
 */
const users: MyUser[] = [
  {
    id: '1001',
    username: 'user1',
    firstName: 'tinker',
    lastName: 'bell',
    password: 'abc',
    email: 'usr1@lb.com',
    signingKey: 'AZeb==',
  },
  {
    id: '1002',
    username: 'user2',
    firstName: 'rosetta',
    lastName: 'fawn',
    password: 'xyz',
    email: 'usr2@lb2.com',
    signingKey: 'BuIx=+',
  },
  {
    id: '1003',
    username: 'testuser',
    firstName: 'vidia',
    lastName: 'zarina',
    password: 'xyz',
    email: 'test@example.com',
    signingKey: 'HuYa=+',
  },
];

/**
 * find a user by a name and password
 * @param username - User name
 * @param password - Password
 */
function findUser(username: string, password: string) {
  return users.find(
    user => user.username === username && user.password === password,
  );
}

/**
 * create a jwt token
 * @param user - User
 * @param scopes - Scopes
 * @param signingKey - Signing key
 */
async function createJwt(
  user: MyUser,
  scopes: string,
  signingKey: string,
  clientId: string,
) {
  const jti = Math.floor(Math.random() * Math.floor(1000));
  const token = jwt.sign(
    {
      id: user.id,
      userId: user.id,
      jti: jti,
      sub: user.id,
      name: '' + user.firstName + ' ' + user.lastName,
      last_name: user.lastName,
      first_name: user.firstName,
      email: user.email,
      username: user.email,
      iss: 'sample oauth provider',
      exp: Math.floor(Date.now() / 1000) + 5 * 1000,
      iat: Math.floor(Date.now() / 1000),
      grant_type: 'auth code',
      scopes: scopes,
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
 * @param token - token
 */
async function verifyToken(token: string) {
  const unwrappedJwt = jwt.decode(token, {json: true, complete: true});
  if (unwrappedJwt == null) throw new Error('invalid token');
  const tokenId = (unwrappedJwt.payload as jwt.JwtPayload).jti;
  if (!tokenId) throw new Error('invalid token');
  const registeredApp = registeredApps.get(
    (unwrappedJwt.payload as jwt.JwtPayload).client_id,
  );
  if (registeredApp) {
    const issuedToken = registeredApp.issuedTokens.get(String(tokenId));
    if (!issuedToken) throw new Error('invalid token');
    const result = jwt.verify(token, issuedToken.signingKey);
    if (result) {
      return result as Record<string, unknown>;
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
    res.status(400).send({error: 'missing redirect_uri'});
    return;
  }
  if (!req.query.client_id) {
    res.status(400).send({error: 'missing client_id'});
    return;
  }
  if (registeredApps.has(req.query.client_id as string)) {
    let params =
      '?client_id=' +
      req.query.client_id +
      '&redirect_uri=' +
      req.query.redirect_uri;
    if (req.query.scope) {
      params = params + '&scope=' + req.query.scope;
    }
    res.redirect('/login' + params);
  } else {
    res.status(401).send({error: 'invalid client_id'});
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
app.post(
  '/login_submit',
  urlencodedParser,
  asyncHandler(async function (req, res) {
    if (!req.body.username) {
      res.status(400).send({error: 'missing username'});
      return;
    }
    const user: MyUser | undefined = findUser(
      req.body.username,
      req.body.password,
    );
    if (user) {
      // get registered app
      const registeredApp = registeredApps.get(req.body.client_id);
      if (!registeredApp) {
        res.status(401).send({error: 'invalid client_id'});
        return;
      }
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
      registeredApp.tokens.set(String(authCode), {token: result.token});
      registeredApp.issuedTokens.set(String(result.id), {
        signingKey: user.signingKey,
        code: authCode,
      });
      // redirect to call back url with the access code
      const callbackUrl = parseRedirectUri(req.body.redirect_uri);
      if (!callbackUrl) {
        res.status(400).send({error: 'invalid redirect_uri'});
        return;
      }
      callbackUrl.searchParams.set('client_id', req.body.client_id);
      callbackUrl.searchParams.set('code', String(authCode));
      res.redirect(callbackUrl.href);
    } else {
      res.sendStatus(401);
    }
  }),
);

/**
 * Endpoint: POST '/oauth/token'
 * Returns: token
 *
 * returns token in exchange for access code
 */
app.post('/oauth/token', urlencodedParser, function (req, res) {
  if (!req.body.client_id) {
    res.status(400).send({error: 'missing client_id'});
    return;
  }
  const registeredApp = registeredApps.get(req.body.client_id);
  if (registeredApp) {
    //&& apps[req.query.client_id].client_secret === req.query.client_secret
    const oauthState = registeredApp.tokens.get(String(req.body.code));
    if (oauthState) {
      res.setHeader('Content-Type', 'application/json');
      res.send({access_token: oauthState.token});
    } else {
      res.status(401).send({error: 'invalid code'});
    }
  } else {
    res.status(401).send({error: 'invalid client_id'});
  }
});

/**
 * Endpoint: GET '/oauth/token'
 * Returns: token
 *
 * returns token in exchange for access code
 */
app.get('/oauth/token', function (req, res) {
  const clientId = req.query.client_id as string;
  if (!clientId) {
    res.status(400).send({error: 'missing client_id'});
    return;
  }
  const registeredApp = registeredApps.get(clientId);
  if (registeredApp) {
    //&& apps[req.query.client_id].client_secret === req.query.client_secret
    const oauthState = registeredApp.tokens.get(req.query.code as string);
    if (oauthState) {
      res.setHeader('Content-Type', 'application/json');
      res.send({access_token: oauthState.token});
    } else {
      res.status(401).send({error: 'invalid code'});
    }
  } else {
    res.status(401).send({error: 'invalid client id'});
  }
});

/**
 * Endpoint: '/verify'
 * Returns: user profile
 *
 * Verifies token and returns user profile
 */
app.get(
  '/verify',
  asyncHandler(async function (req, res) {
    try {
      const token = (req.query.access_token ??
        req.header('Authorization')) as string;
      if (!token) {
        res.status(400).send({error: 'missing access_token'});
        return;
      }
      const result = await verifyToken(token);
      const expirationTime = result.exp;
      res.setHeader('Content-Type', 'application/json');
      res.send({...result, expirationTime: expirationTime});
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      res.status(401).send({error: err.message});
    }
  }),
);

export function startApp(port = 9000) {
  server = app.listen(port);
  return server;
}

export function stopApp() {
  server.close();
}
