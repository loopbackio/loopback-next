// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('debug')('loopback:example:lb3application');

module.exports = function (CoffeeShop) {
  CoffeeShop.status = async function () {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const OPEN_HOUR = 6;
    const CLOSE_HOUR = 20;
    debug('Current hour is %d', currentHour);
    let response;
    if (currentHour > OPEN_HOUR && currentHour < CLOSE_HOUR) {
      response = 'We are open for business.';
    } else {
      response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
    }
    return response;
  };
  CoffeeShop.remoteMethod('status', {
    http: {
      path: '/status',
      verb: 'get',
    },
    returns: {
      arg: 'status',
      type: 'string',
    },
  });

  CoffeeShop.greet = async function () {
    return 'Hello from this Coffee Shop';
  };
  CoffeeShop.remoteMethod('greet', {
    http: {path: '/greet', verb: 'get'},
    returns: {arg: 'greeting', type: 'string'},
  });
};
