// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationObject} from '@loopback/openapi-v3-types';
import {expect} from '@loopback/testlab';
import {get, getControllerSpec} from '../..';

describe('controller spec', () => {
  it('allows operations to provide definition of referenced models', () => {
    class MyController {
      @get('/todos', {
        responses: {
          '200': {
            description: 'Array of Category model instances',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Todo',
                  definitions: {
                    Todo: {
                      title: 'Todo',
                      properties: {
                        title: {type: 'string'},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
      async find(): Promise<object[]> {
        return []; // dummy implementation, it's never called
      }
    }

    const spec = getControllerSpec(MyController);
    const opSpec: OperationObject = spec.paths['/todos'].get;
    const responseSpec = opSpec.responses['200'].content['application/json'];
    expect(responseSpec.schema).to.deepEqual({
      $ref: '#/components/schemas/Todo',
    });

    const globalSchemas = (spec.components || {}).schemas;
    expect(globalSchemas).to.deepEqual({
      Todo: {
        title: 'Todo',
        properties: {
          title: {
            type: 'string',
          },
        },
      },
    });
  });
});
