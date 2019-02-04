// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';
import {param, requestBody, getControllerSpec, post} from '../../';

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
            'x-operation-name': 'createUser',
          },
        },
      },
      components: {
        schemas: {
          User: {
            title: 'User',
            properties: {name: {type: 'string'}, password: {type: 'number'}},
          },
        },
      },
    };
    const spec = getControllerSpec(MyController);
    expect(spec).to.eql(expectedSpec);
  });
});
