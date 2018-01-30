// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = {
  name: 'Account',
  properties: {
    id: {
      type: 'string',
      required: true,
      id: true
    },
    customerNumber: {
      type: 'string',
      required: true
    },
    balance: {
      type: 'number',
      required: true
    },
    branch: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: true
    },
    avgBalance: {
      type: 'number',
      required: true
    },
    minimumBalance: {
      type: 'number',
      required: true
    }
  }
};
