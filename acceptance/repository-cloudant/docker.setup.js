// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-cloudant
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const _ = require('lodash');
const async = require('async');
const docker = new require('dockerode')();
const http = require('http');
const ms = require('ms');
const fs = require('fs');

/**
 * This script creates a new couchDB3 container locally. And it also creates the admin for
 * the container. Type in bash command:
 * ```bash
 * CLOUDANT_PASSWORD=myadmin CLOUDANT_PASSWORD=mypass CLOUDANT_DATABASE=mydb node docker.setup.sh
 * ```
 * to customize the names.
 */

process.env.CLOUDANT_DATABASE = process.env.CLOUDANT_DATABASE || 'testdb';
process.env.CLOUDANT_PASSWORD = process.env.CLOUDANT_PASSWORD || 'pass';
process.env.CLOUDANT_USERNAME = process.env.CLOUDANT_USERNAME || 'admin';

// these are placeholders. They get set dynamically based on what IP and port
// get assigned by docker.
process.env.CLOUDANT_PORT = 'TBD';
process.env.CLOUDANT_HOST = 'TBD';
process.env.CLOUDANT_URL = 'TBD';

const CONNECT_RETRIES = 30;
const CONNECT_DELAY = ms('5s');

let containerToDelete = null;

async.waterfall(
  [
    // The tag 'latest' fails on creating the instance because the image got updated.
    // Using the stable one here to pass tests.
    // Reverse back to latest once it's fixed.
    dockerStart('ibmcom/couchdb3:preview-1575988511'),
    sleep(ms('2s')),
    setCloudantEnv,
    waitFor('/_all_dbs'),
    createAdmin(),
    createDB(process.env.CLOUDANT_DATABASE),
    listUser(),
    exportENV(),
  ],
  function(testErr) {
    if (testErr) {
      console.error('error running tests:', testErr);
      process.exit(1);
    }
  },
);

function sleep(n) {
  return function delayedPassThrough() {
    // eslint-disable-next-line prefer-rest-params
    const args = [].slice.call(arguments);
    // last argument is the callback
    const next = args.pop();
    // prepend `null` to indicate no error
    args.unshift(null);
    setTimeout(function() {
      // eslint-disable-next-line prefer-spread
      next.apply(null, args);
    }, n);
  };
}

function dockerStart(imgName) {
  return function pullAndStart(next) {
    console.log('pulling image: %s', imgName);
    docker.pull(imgName, function(err, stream) {
      // eslint-disable-next-line no-shadow
      docker.modem.followProgress(stream, function(err, output) {
        if (err) {
          return next(err);
        }
        console.log('starting container from image: %s', imgName);
        docker.createContainer(
          {
            Image: imgName,
            HostConfig: {
              PublishAllPorts: true,
            },
          },
          // eslint-disable-next-line no-shadow
          function(err, container) {
            console.log(
              'recording container for later cleanup: ',
              container.id,
            );
            containerToDelete = container;
            if (err) {
              return next(err);
            }
            // eslint-disable-next-line no-shadow
            container.start(function(err, data) {
              next(err, container);
            });
          },
        );
      });
    });
  };
}

function setCloudantEnv(container, next) {
  container.inspect(function(err, c) {
    // if swarm, Node.Ip will be set to actual node's IP
    // if not swarm, but remote docker, use docker host's IP
    // if local docker, use localhost
    const host = _.get(c, 'Node.IP', _.get(docker, 'modem.host', '127.0.0.1'));
    // couchdb uses TCP/IP port 5984
    // container's port 5984 is dynamically mapped to an external port
    const port = _.get(c, [
      'NetworkSettings',
      'Ports',
      '5984/tcp',
      '0',
      'HostPort',
    ]);
    process.env.CLOUDANT_PORT = port;
    process.env.CLOUDANT_HOST = host;
    const usr = process.env.CLOUDANT_USERNAME;
    const pass = process.env.CLOUDANT_PASSWORD;
    process.env.CLOUDANT_URL =
      'http://' + usr + ':' + pass + '@' + host + ':' + port;
    console.log(
      'env:',
      _.pick(process.env, [
        'CLOUDANT_URL',
        'CLOUDANT_HOST',
        'CLOUDANT_PORT',
        'CLOUDANT_USERNAME',
        'CLOUDANT_PASSWORD',
        'CLOUDANT_DATABASE',
      ]),
    );
    next(null, container);
  });
}

function waitFor(path) {
  return function waitForPath(container, next) {
    const opts = {
      host: process.env.CLOUDANT_HOST,
      port: process.env.CLOUDANT_PORT,
      path: path,
    };

    console.log(`waiting for instance to respond: ${opts}`);
    return ping(null, CONNECT_RETRIES);

    function ping(err, tries) {
      console.log('ping (%d/%d)', CONNECT_RETRIES - tries, CONNECT_RETRIES);
      if (tries < 1) {
        next(err || new Error('failed to contact Cloudant'));
      }
      http
        .get(opts, function(res) {
          res.pipe(devNull());
          res.on('error', tryAgain);
          res.on('end', function() {
            if (res.statusCode === 200) {
              setImmediate(next, null, container);
            } else {
              tryAgain();
            }
          });
        })
        .on('error', tryAgain);
      // eslint-disable-next-line no-shadow
      function tryAgain(err) {
        setTimeout(ping, CONNECT_DELAY, err, tries - 1);
      }
    }
  };
}

function createAdmin() {
  return function createAdminUser(container, next) {
    const data = `"${process.env.CLOUDANT_PASSWORD}"`;
    const uri =
      '/_node/couchdb@127.0.0.1/_config/admins/' +
      process.env.CLOUDANT_USERNAME;
    const opts = {
      method: 'PUT',
      path: uri,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      host: process.env.CLOUDANT_HOST,
      port: process.env.CLOUDANT_PORT,
      body: data,
    };

    const req = http.request(opts, function(res) {
      res.pipe(devNull());
      res.on('error', next);
      res.on('end', function() {
        setImmediate(next, null, container);
      });
    });
    req.write(data);
    req.end();
  };
}

function createDB(db) {
  return function create(container, next) {
    const opts = {
      method: 'PUT',
      path: '/' + db,
      host: process.env.CLOUDANT_HOST,
      port: process.env.CLOUDANT_PORT,
      auth: process.env.CLOUDANT_USERNAME + ':' + process.env.CLOUDANT_PASSWORD,
    };
    console.log('creating db: %j', db);
    http
      .request(opts, function(res) {
        res.pipe(devNull());
        res.on('error', next);
        res.on('end', function() {
          setImmediate(next, null, container);
        });
      })
      .on('error', next)
      .end();
  };
}

function listUser() {
  return function printUsers(container, next) {
    const path = '/_node/couchdb@127.0.0.1/_config/admins';
    const opts = {
      method: 'GET',
      path: path,
      host: process.env.CLOUDANT_HOST,
      port: process.env.CLOUDANT_PORT,
      auth: process.env.CLOUDANT_USERNAME + ':' + process.env.CLOUDANT_PASSWORD,
    };
    // console.log('creating db: %j', db);
    http
      .request(opts, function(res) {
        res.pipe(devNull());
        res.on('error', next);

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', chunk => {
          rawData += chunk;
        });

        res.on('end', function() {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
          } catch (e) {
            console.error(e.message);
          }
          setImmediate(next, null, container);
        });
      })
      .on('error', next)
      .end();
  };
}

function exportENV() {
  return function createENVFile(container, next) {
    const content =
      "export CLOUDANT_URL='" +
      process.env.CLOUDANT_URL +
      "'\n" +
      "export CLOUDANT_DATABASE='" +
      process.env.CLOUDANT_DATABASE +
      "'\n" +
      "export CLOUDANT_USER='" +
      process.env.CLOUDANT_USERNAME +
      "'\n" +
      "export CLOUDANT_PASSWORD='" +
      process.env.CLOUDANT_PASSWORD +
      "'\n" +
      'export CLOUDANT_PORT=' +
      process.env.CLOUDANT_PORT +
      '\n' +
      "export CLOUDANT_HOST='" +
      process.env.CLOUDANT_HOST +
      "'";
    console.log('current directory: ' + __dirname);
    fs.writeFileSync('cloudant-config.sh', content, 'utf8');
    next();
  };
}

// clean up any previous containers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dockerCleanup(next) {
  if (containerToDelete) {
    console.log('cleaning up container: %s', containerToDelete.id);
    containerToDelete.remove({force: true}, function(err) {
      next(err);
    });
  } else {
    setImmediate(next);
  }
}

// A Writable Stream that just consumes a stream. Useful for draining readable
// streams so that they 'end' properly, like sometimes-empty http responses.
function devNull() {
  return new require('stream').Writable({
    write: function(_chunk, _encoding, cb) {
      return cb(null);
    },
  });
}
