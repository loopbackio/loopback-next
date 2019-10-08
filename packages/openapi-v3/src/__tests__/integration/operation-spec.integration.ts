// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {get, getControllerSpec, param, post, requestBody} from '../../';

describe('operation arguments', () => {
  it('generate parameters and requestBody for operation', () => {
    @model()
    class User {
      @property()
      name: string;
      @property()
      password: number;
    }

    class MyController {
      @post('/users/{location}')
      async createUser(
        @param.query.string('type') type: string,
        @param.header.string('token') token: string,
        @param.path.string('location') location: string,
        @requestBody() user: User,
      ): Promise<void> {
        return;
      }
    }

    const expectedSpec = {
      paths: {
        '/users/{location}': {
          post: {
            responses: {
              '200': {description: 'Return value of MyController.createUser'},
            },
            parameters: [
              {name: 'type', in: 'query', schema: {type: 'string'}},
              {name: 'token', in: 'header', schema: {type: 'string'}},
              {
                name: 'location',
                in: 'path',
                required: true,
                schema: {type: 'string'},
              },
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {$ref: '#/components/schemas/User'},
                },
              },
              'x-parameter-index': 3,
            },
            'x-controller-name': 'MyController',
            'x-operation-name': 'createUser',
            operationId: 'MyController.createUser',
          },
        },
      },
      components: {
        schemas: {
          User: {
            title: 'User',
            properties: {name: {type: 'string'}, password: {type: 'number'}},
            additionalProperties: false,
          },
        },
      },
    };
    const spec = getControllerSpec(MyController);
    expect(spec).to.eql(expectedSpec);
  });

  it('allows operation metadata in @get', () => {
    class MyController {
      @get('/users', {
        operationId: 'find_users',
        responses: {
          '200': {description: 'Users found'},
        },
      })
      async findUsers(): Promise<string[]> {
        return [];
      }
    }
    const expectedSpec = {
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {description: 'Users found'},
            },
            'x-controller-name': 'MyController',
            'x-operation-name': 'findUsers',
            operationId: 'find_users',
          },
        },
      },
    };
    const spec = getControllerSpec(MyController);
    expect(spec).to.eql(expectedSpec);
  });
});
