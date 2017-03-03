// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const def = {
  basePath: '/',
  paths: {
    '/health': {
      get: {
        'x-operation-name': 'getHealth',
        responses: {
          200: {
            schema: {
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
};
