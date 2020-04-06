// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {getControllerSpec, post, requestBody} from '../../../../';

describe('requestBody decorator - shortcuts', () => {
  context('array', () => {
    it('generates the correct schema spec for an array argument', () => {
      const description = 'an array of names';
      class MyController {
        @post('/greeting')
        greet(
          @requestBody.array({type: 'string'}, {description, required: false})
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
        description,
        required: false,
        content: expectedContent,
      });
    });
  });

  context('file', () => {
    it('generates the correct schema spec for a file argument', () => {
      const description = 'a picture';
      class MyController {
        @post('/pictures')
        upload(
          @requestBody.file({description, required: true})
          request: unknown, // It should be `Request` from `@loopback/rest`
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);
      const expectedContent = {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {file: {type: 'string', format: 'binary'}},
          },
        },
      };

      const requestBodySpec = actualSpec.paths['/pictures']['post'].requestBody;
      expect(requestBodySpec).to.have.properties({
        description,
        required: true,
        content: expectedContent,
      });
    });
  });
});
