// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// In this file, we provide a LoopBack 3 application with a `Customer` model
// inheriting from a custom `UserBase` model that's inheriting from the LB3
// built-in model `User`.

const loopback = require('loopback');
const app = loopback();
module.exports = app;

app.dataSource('db', {connector: 'memory'});

app.registry.createModel(
  'UserBase',
  {
    isAccountVerified: {
      type: 'boolean',
      required: true,
      default: false,
    },
  },
  {
    base: 'User',
    customUserBaseSetting: true,
  },
);
// Note that `UserBase` is not attached to any datasource!

const Customer = app.registry.createModel(
  'Customer',
  {
    isPreferred: 'boolean',
  },
  {
    base: 'UserBase',
    customCustomerSetting: true,
  },
);
app.model(Customer, {dataSource: 'db'});
