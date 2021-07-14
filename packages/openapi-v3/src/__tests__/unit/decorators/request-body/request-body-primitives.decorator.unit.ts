// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  ContentObject,
  ControllerSpec,
  getControllerSpec,
  post,
  requestBody,
  SchemaObject,
} from '../../../../';

describe('requestBody decorator', () => {
  context('for a primitive type', () => {
    let actualSpec: ControllerSpec;
    let expectedContent: ContentObject;

    it('infers number', () => {
      class MyController {
        @post('/greeting')
        greet(@requestBody() name: number) {}
      }
      assertRequestBodySpec({type: 'number'}, MyController);
    });

    it('infers string', () => {
      class MyController {
        @post('/greeting')
        greet(@requestBody() name: string) {}
      }
      assertRequestBodySpec({type: 'string'}, MyController);
    });

    it('infers boolean', () => {
      class MyController {
        @post('/greeting')
        greet(@requestBody() name: boolean) {}
      }
      assertRequestBodySpec({type: 'boolean'}, MyController);
    });

    it('infers object', () => {
      class MyController {
        @post('/greeting')
        greet(@requestBody() name: object) {}
      }
      assertRequestBodySpec({type: 'object'}, MyController);
    });

    it('infers array', () => {
      class MyController {
        @post('/greeting')
        greet(@requestBody() name: string[]) {}
      }
      assertRequestBodySpec({type: 'array'}, MyController);
    });

    function assertRequestBodySpec(
      expectedSchemaSpec: SchemaObject,
      controller: Class<{}>,
    ) {
      actualSpec = getControllerSpec(controller);
      expectedContent = {
        'application/json': {
          schema: expectedSchemaSpec,
        },
      };
      expect(actualSpec.paths['/greeting']['post'].requestBody.content).to.eql(
        expectedContent,
      );
    }
  });
});
