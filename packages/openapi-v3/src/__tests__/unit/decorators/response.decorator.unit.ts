// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import * as httpStatus from 'http-status';
import {ResponseObject} from 'openapi3-ts';
import {getControllerSpec} from '../../..';
import {get, response} from '../../../decorators';

describe('@response decorator', () => {
  it('allows a class to not be decorated with @response at all', () => {
    class MyController {
      @get('/greet')
      greet() {
        return 'Hello world!';
      }
    }

    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.responses['200'].description).to.eql(
      'Return value of MyController.greet',
    );
  });

  context('with response models', () => {
    @model()
    class SuccessModel extends Model {
      constructor(err: Partial<SuccessModel>) {
        super(err);
      }
      @property({default: 'ok'})
      message: string;
    }

    @model()
    class FooError extends Model {
      constructor(err: Partial<FooError>) {
        super(err);
      }
      @property({default: 'foo'})
      foo: string;
    }

    @model()
    class BarError extends Model {
      constructor(err: Partial<BarError>) {
        super(err);
      }
      @property({default: 'bar'})
      bar: string;
    }

    const successSchema: ResponseObject = {
      description: httpStatus['200_MESSAGE'],
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/SuccessModel',
          },
        },
      },
    };

    const fooBarSchema: ResponseObject = {
      description: httpStatus['404_MESSAGE'],
      content: {
        'application/json': {
          schema: {
            anyOf: [
              {$ref: '#/components/schemas/BarError'},
              {$ref: '#/components/schemas/FooError'},
            ],
          },
        },
      },
    };

    it('supports a single @response decorator', () => {
      class MyController {
        @get('/greet')
        @response(200, SuccessModel)
        greet() {
          return new SuccessModel({message: 'Hello, world'});
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/greet'].get.responses[200]).to.eql(
        successSchema,
      );
      expect(
        actualSpec.components?.schemas?.SuccessModel,
      ).to.not.be.undefined();
    });

    it('supports multiple @response decorators on a method', () => {
      class MyController {
        @get('/greet')
        @response(200, SuccessModel)
        @response(404, FooError)
        @response(404, BarError)
        greet() {
          throw new FooError({foo: 'bar'});
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/greet'].get.responses[404]).to.eql(
        fooBarSchema,
      );
      expect(actualSpec.components?.schemas?.FooError).to.not.be.undefined();
      expect(actualSpec.components?.schemas?.BarError).to.not.be.undefined();
      expect(
        actualSpec.components?.schemas?.SuccessModel,
      ).to.not.be.undefined();
    });
    it('supports multiple @response decorators with an array of models', () => {
      class MyController {
        @get('/greet')
        @response(200, SuccessModel)
        @response(404, [BarError, FooError])
        greet() {
          throw new BarError({bar: 'baz'});
        }
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet'].get.responses[404]).to.eql(
        fooBarSchema,
      );
      expect(actualSpec.components?.schemas?.FooError).to.not.be.undefined();
      expect(actualSpec.components?.schemas?.BarError).to.not.be.undefined();
      expect(
        actualSpec.components?.schemas?.SuccessModel,
      ).to.not.be.undefined();
    });

    context('with complex responses', () => {
      const FIRST_SCHEMA = {
        type: 'object',
        properties: {
          x: {
            type: 'int',
            default: 1,
          },
          y: {
            type: 'string',
            default: '2',
          },
        },
      };

      const SECOND_SCHEMA = {
        type: 'string',
        format: 'base64',
      };

      class MyController {
        @get('/greet', {
          responses: {
            200: {
              description: 'Unknown',
              content: {
                'application/json': {schema: FIRST_SCHEMA},
              },
            },
          },
        })
        @response(200, SECOND_SCHEMA, {contentType: 'application/pdf'})
        @response(200, SuccessModel, {contentType: 'application/jsonc'})
        @response(404, [FooError, BarError], {contentType: 'application/jsonc'})
        greet() {
          return new SuccessModel({message: 'Hello, world!'});
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(
        actualSpec.paths['/greet'].get.responses[200].content[
          'application/json'
        ],
      ).to.not.be.undefined();
      expect(
        actualSpec.paths['/greet'].get.responses[200].content[
          'application/pdf'
        ],
      ).to.not.be.undefined();

      expect(
        actualSpec.paths['/greet'].get.responses[200].content[
          'application/jsonc'
        ],
      ).to.not.be.undefined();
      expect(
        actualSpec.paths['/greet'].get.responses[200].content[
          'application/json'
        ].schema,
      ).to.eql(FIRST_SCHEMA);

      expect(
        actualSpec.paths['/greet'].get.responses[200].content['application/pdf']
          .schema,
      ).to.eql(SECOND_SCHEMA);

      expect(
        actualSpec.paths['/greet'].get.responses[200].content[
          'application/jsonc'
        ].schema,
      ).to.eql({$ref: '#/components/schemas/SuccessModel'});
    });
  });
});
