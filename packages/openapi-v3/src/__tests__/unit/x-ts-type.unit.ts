// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {RequestBodyObject, ResponseObject} from 'openapi3-ts';
import {getControllerSpec} from '../..';
import {get, post, requestBody} from '../../decorators';

describe('x-ts-type is converted in the right places', () => {
  // setup the models for use
  @model()
  class TestRequest extends Model {
    @property({default: 1})
    value: number;
  }
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
  class NotError extends Model {
    constructor(err: Partial<NotError>) {
      super(err);
    }
    @property({default: true})
    fail: boolean;
  }

  @model()
  class BarError extends Model {
    constructor(err: Partial<BarError>) {
      super(err);
    }
    @property({default: 'bar'})
    bar: string;
  }

  const testRequestSchema: RequestBodyObject = {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/TestRequest',
        },
      },
    },
  };
  const successSchema: ResponseObject = {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/SuccessModel',
        },
      },
    },
  };

  const notSchema: ResponseObject = {
    description: 'Failure',
    content: {
      'application/json': {
        schema: {
          not: {$ref: '#/components/schemas/BarError'},
        },
      },
    },
  };
  const fooBarSchema = (k: 'anyOf' | 'allOf' | 'oneOf'): ResponseObject => ({
    description: 'Failure',
    content: {
      'application/json': {
        schema: {
          [k]: [
            {$ref: '#/components/schemas/FooError'},
            {$ref: '#/components/schemas/BarError'},
          ],
          not: {$ref: '#/components/schemas/NotError'},
        },
      },
    },
  });

  it('Allows a simple request schema', () => {
    class MyController {
      @post('/greet')
      greet(@requestBody() body: TestRequest) {
        return 'Hello world!';
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].post.requestBody).to.eql(
      testRequestSchema,
    );
  });

  it('Does not process existing $ref responses', () => {
    const successContent = {$ref: '#/components/schema/SomeReference'};
    class MyController {
      @post('/greet', {
        responses: {
          201: successContent,
        },
      })
      greet(@requestBody() body: TestRequest) {
        return 'Hello world!';
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].post.responses[201]).to.eql(
      successContent,
    );
  });

  it('Allows for a response schema using the spec', () => {
    class MyController {
      @get('/greet', {
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  'x-ts-type': SuccessModel,
                },
              },
            },
          },
        },
      })
      greet() {
        return new SuccessModel({message: 'hello, world'});
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.responses[200]).to.eql(successSchema);
    expect(actualSpec.components?.schemas?.SuccessModel).to.not.be.undefined();
  });

  it('Allows `anyOf` responses', () => {
    class MyController {
      @get('/greet', {
        responses: {
          404: {
            description: 'Failure',
            content: {
              'application/json': {
                schema: {
                  anyOf: [{'x-ts-type': FooError}, {'x-ts-type': BarError}],
                  not: {'x-ts-type': NotError},
                },
              },
            },
          },
        },
      })
      greet() {
        throw new FooError({foo: 'foo'});
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.responses[404]).to.eql(
      fooBarSchema('anyOf'),
    );
  });
  it('Allows `allOf` responses', () => {
    class MyController {
      @get('/greet', {
        responses: {
          404: {
            description: 'Failure',
            content: {
              'application/json': {
                schema: {
                  allOf: [{'x-ts-type': FooError}, {'x-ts-type': BarError}],
                  not: {'x-ts-type': NotError},
                },
              },
            },
          },
        },
      })
      greet() {
        throw new FooError({foo: 'foo'});
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.responses[404]).to.eql(
      fooBarSchema('allOf'),
    );
  });

  it('Allows `oneOf` responses', () => {
    class MyController {
      @get('/greet', {
        responses: {
          404: {
            description: 'Failure',
            content: {
              'application/json': {
                schema: {
                  oneOf: [{'x-ts-type': FooError}, {'x-ts-type': BarError}],
                  not: {'x-ts-type': NotError},
                },
              },
            },
          },
        },
      })
      greet() {
        throw new FooError({foo: 'foo'});
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.responses[404]).to.eql(
      fooBarSchema('oneOf'),
    );
  });
  it('Allows `not` responses', () => {
    class MyController {
      @get('/greet', {
        responses: {
          404: {
            description: 'Failure',
            content: {
              'application/json': {
                schema: {
                  not: {'x-ts-type': BarError},
                },
              },
            },
          },
        },
      })
      greet() {
        throw new FooError({foo: 'foo'});
      }
    }
    const actualSpec = getControllerSpec(MyController);
    expect(actualSpec.paths['/greet'].get.responses[404]).to.eql(notSchema);
  });
});
