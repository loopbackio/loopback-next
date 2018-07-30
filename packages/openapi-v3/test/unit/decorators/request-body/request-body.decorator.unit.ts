// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {post, requestBody, getControllerSpec} from '../../../..';
import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';

describe('requestBody decorator', () => {
  context('can build a correct "RequestBody" spec and', () => {
    it('persists "description" and "required" into the generated schema', () => {
      const requestSpec = {
        description: 'A sample request body',
        required: true,
      };
      class MyController {
        @post('/greeting')
        greet(@requestBody(requestSpec) name: string) {}
      }

      const requestBodySpec = getControllerSpec(MyController).paths[
        '/greeting'
      ]['post'].requestBody;
      expect(requestBodySpec).to.have.properties({
        description: 'A sample request body',
        required: true,
      });
    });

    it('defaults content-type to "application/json"', () => {
      const requestSpec = {
        description: 'A sample request body',
        required: true,
      };
      class MyController {
        @post('/greeting')
        greet(@requestBody(requestSpec) name: string) {}
      }

      const requestBodySpec = getControllerSpec(MyController).paths[
        '/greeting'
      ]['post'].requestBody;
      expect(requestBodySpec.content).to.have.key('application/json');
    });

    it('infers request body with complex type', () => {
      const expectedContent = {
        'application/text': {
          schema: {$ref: '#/components/schemas/MyModel'},
        },
      };

      @model()
      class MyModel {
        @property()
        name: string;
      }

      class MyController {
        @post('/MyModel')
        createMyModel(
          @requestBody({content: {'application/text': {}}}) inst: MyModel,
        ) {}
      }

      const requestBodySpec = getControllerSpec(MyController).paths['/MyModel'][
        'post'
      ].requestBody;
      expect(requestBodySpec.content).to.deepEqual(expectedContent);
    });

    it('preserves user-provided schema in requestBody', () => {
      const expectedContent = {
        'application/json': {
          schema: {type: 'object'},
        },
      };

      class MyModel {}

      class MyController {
        @post('/MyModel')
        createMyModel(@requestBody({content: expectedContent}) inst: MyModel) {}
      }

      const requestBodySpec = getControllerSpec(MyController).paths['/MyModel'][
        'post'
      ].requestBody;
      expect(requestBodySpec.content).to.deepEqual(expectedContent);
    });

    it('preserves user-provided reference in requestBody', () => {
      const expectedContent = {
        'application/json': {
          schema: {$ref: '#/components/schemas/MyModel'},
        },
      };

      class MyModel {}

      class MyController {
        @post('/MyModel')
        createMyModel(
          @requestBody({content: expectedContent}) inst: Partial<MyModel>,
        ) {}
      }

      const requestBodySpec = getControllerSpec(MyController).paths['/MyModel'][
        'post'
      ].requestBody;
      expect(requestBodySpec.content).to.deepEqual(expectedContent);
    });

    it('reports error if more than one requestBody are found for the same method', () => {
      class MyController {
        @post('/greeting')
        greet(@requestBody() name: string, @requestBody() foo: number) {}
      }
      expect(() => getControllerSpec(MyController)).to.throwError(
        /An operation should only have one parameter decorated by @requestBody/,
      );
    });
  });
});
