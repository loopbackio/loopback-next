// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {getControllerSpec, requestBody, post} from '../../../../';

describe('requestBody decorator - shortcuts', () => {
  context('array', () => {
    it('generates the correct schema spec for an array argument', () => {
      const description = 'an array of names';
      class MyController {
        @post('/greeting')
        greet(
          @requestBody.array(
            {type: 'string'},
            {description: description, required: false},
          )
          name: string[],
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);
      const expectedContent = {
        'application/json': {
          schema: {
            type: 'array',
            items: {type: 'string'},
          },
        },
      };

      const requestBodySpec = actualSpec.paths['/greeting']['post'].requestBody;
      expect(requestBodySpec).to.have.properties({
        description: description,
        required: false,
        content: expectedContent,
      });
    });
  });
});
