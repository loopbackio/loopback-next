// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import * as httpStatus from 'http-status';
import {ResponseObject} from 'openapi3-ts';
import {get, getControllerSpec, oas, param} from '../../..';

describe('@oas.response decorator', () => {
  it('allows a class to not be decorated with @oas.response at all', () => {
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
      description: httpStatus['200'],
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/SuccessModel',
          },
        },
      },
    };

    const fooBarSchema: ResponseObject = {
      description: httpStatus['404'],
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

    it('supports a single @oas.response decorator', () => {
      class MyController {
        @get('/greet')
        @oas.response(200, SuccessModel)
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

    it('supports multiple @oas.response decorators on a method', () => {
      class MyController {
        @get('/greet')
        @oas.response(200, SuccessModel)
        @oas.response(404, FooError)
        @oas.response(404, BarError)
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
    it('supports multiple @oas.response decorators with an array of models', () => {
      class MyController {
        @get('/greet')
        @oas.response(200, SuccessModel)
        @oas.response(404, BarError, FooError)
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

      class MyController {
        @get('/greet', {
          responses: {
            200: {
              description: 'Unknown',
              content: {
                'application/jsonc': {schema: FIRST_SCHEMA},
              },
            },
          },
        })
        @oas.response(200, SuccessModel, {
          content: {
            'application/pdf': {schema: {type: 'string', format: 'base64'}},
          },
        })
        @oas.response(404, FooError, BarError)
        greet() {
          return new SuccessModel({message: 'Hello, world!'});
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(
        actualSpec.paths['/greet'].get.responses[200].content[
          'application/jsonc'
        ],
      ).to.not.be.undefined();

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
          'application/json'
        ].schema,
      ).to.eql({$ref: '#/components/schemas/SuccessModel'});
    });
  });

  context('@oas.response.file', () => {
    it('allows @oas.response.file with media types', () => {
      class MyController {
        @get('/files/{filename}')
        @oas.response.file('image/jpeg', 'image/png')
        download(@param.path.string('filename') fileName: string) {
          // use response.download(...);
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/files/{filename}'].get.responses['200']).to.eql(
        {
          description: 'The file content',
          content: {
            'image/jpeg': {
              schema: {type: 'string', format: 'binary'},
            },
            'image/png': {
              schema: {type: 'string', format: 'binary'},
            },
          },
        },
      );
    });

    it('allows @oas.response.file without media types', () => {
      class MyController {
        @get('/files/{filename}')
        @oas.response.file()
        download(@param.path.string('filename') filename: string) {
          // use response.download(...);
        }
      }

      const actualSpec = getControllerSpec(MyController);
      expect(actualSpec.paths['/files/{filename}'].get.responses['200']).to.eql(
        {
          description: 'The file content',
          content: {
            'application/octet-stream': {
              schema: {type: 'string', format: 'binary'},
            },
          },
        },
      );
    });
  });
});
