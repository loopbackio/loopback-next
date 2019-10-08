// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {getJsonSchemaRef} from '../..';

describe('getJsonSchemaRef', () => {
  it('creates spec referencing shared model schema', () => {
    @model()
    class MyModel {
      @property()
      name: string;
    }

    const spec = getJsonSchemaRef(MyModel);

    expect(spec).to.deepEqual({
      $ref: '#/definitions/MyModel',
      definitions: {
        MyModel: {
          title: 'MyModel',
          properties: {
            name: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
      },
    });
  });
});
