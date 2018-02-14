// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {post, requestBody, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';

describe('Routing metadata for request body', () => {
  describe('@requestBody', () => {
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

        const r = getControllerSpec(MyController).paths['/greeting']['post']
          .requestBody;
        expect(r.description).to.eql('A sample request body');
        expect(r.required).to.eql(true);
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

        const r = getControllerSpec(MyController).paths['/greeting']['post']
          .requestBody;
        expect(r.content).to.have.key('application/json');
      });
      it('infers request body with complex type', () => {
        const expectedContent = {
          'application/text': {
            schema: {$ref: '#/components/schemas/MyModel'},
          },
        };
        @model()
        class MyModel {
          @property() name: string;
        }

        class MyController {
          @post('/MyModel')
          createMyModel(
            @requestBody({content: {'application/text': {}}})
            inst: MyModel,
          ) {}
        }

        const r = getControllerSpec(MyController).paths['/MyModel']['post']
          .requestBody;
        expect(r.content).to.deepEqual(expectedContent);
      });
      it('schema in requestBody overrides the generated schema', () => {
        const expectedContent = {
          'application/json': {
            schema: {type: 'object'},
          },
        };

        class MyModel {}

        class MyController {
          @post('/MyModel')
          createMyModel(
            @requestBody({content: expectedContent})
            inst: MyModel,
          ) {}
        }

        const r = getControllerSpec(MyController).paths['/MyModel']['post']
          .requestBody;
        expect(r.content).to.deepEqual(expectedContent);
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
});
