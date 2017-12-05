// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/example-codehub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerSpec} from '@loopback/rest';

export const def: ControllerSpec = {
  basePath: '/',
  paths: {
    '/health': {
      get: {
        'x-operation-name': 'getHealth',
        responses: {
          200: {
            description: 'Health status of the server',
            schema: {
              properties: {
                uptime: {
                  type: 'number',
                  description: 'the uptime of the server',
                },
              },
            },
          },
        },
      },
    },
  },
};
