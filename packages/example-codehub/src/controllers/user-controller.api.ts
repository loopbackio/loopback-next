// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerSpec} from '@loopback/core';

export const def: ControllerSpec = {
  // IMPORTANT: this controller implements endpoints at different root paths
  // GET /users, GET /user, etc.
  basePath: '/',
  paths: {
    '/users': {
      get: {
        // NOTE(bajtos) This custom property specifies which controller
        // method is handling this operation. The name is in line with
        // what we have in loopback-swagger code generator now.
        'x-operation-name': 'getAllUsers',
        parameters: [
          {
            name: 'since',
            in: 'query',
            description: "The integer ID of the last User that you've seen.",
            required: true,
            type: 'string',
          },
        ],
        responses: {
          200: {
            description: 'A list of user profiles.',
            schema: {
              type: 'array',
              items: {
                // TODO(bajtos) We should $ref a shared definition
                // of User Response/Model
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
    '/user': {
      get: {
        'x-operation-name': 'getAuthenticatedUser',
        responses: {
          200: {
            description: 'User profile.',
            schema: {
              // TODO(bajtos) We should $ref a shared definition of User
              // Response/Model
              type: 'object',
              additionalProperties: true,
            },
          },
          404: {
            description: 'User not found error.',
            schema: {
              // TODO(bajtos) Refer to a shared definition of Error responses
              // as provided by strong-error-handler and/or API Connect
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
      /* TODO(ritch) please fill in details
      patch: {
      },
      */
    },
    '/users/{username}': {
      get: {
        'x-operation-name': 'getUserByUsername',
        parameters: [
          {
            name: 'username',
            in: 'path',
            description: 'The name of the user to look up.',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          200: {
            description: 'User profile.',
            schema: {
              // TODO(bajtos) We should $ref a shared definition of User
              // Response/Model
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    },
  },
};
