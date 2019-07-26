// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {get, getControllerSpec, param, ParameterObject} from '../../../..';

describe('Routing metadata for parameters', () => {
  describe('@param.query.string', () => {
    it('defines a parameter with in:query type:string', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.string('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.number', () => {
    it('defines a parameter with in:query type:number', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.number('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'number',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.integer', () => {
    it('defines a parameter with in:query type:integer', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.integer('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'integer',
          format: 'int32',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.boolean', () => {
    it('defines a parameter with in:query type:boolean', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.boolean('name') name: boolean) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'boolean',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.long', () => {
    it('defines a parameter with in:query type:long', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.long('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'integer',
          format: 'int64',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.float', () => {
    it('defines a parameter with in:query type:float', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.float('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'number',
          format: 'float',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.double', () => {
    it('defines a parameter with in:query type:double', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.double('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'number',
          format: 'double',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.byte', () => {
    it('defines a parameter with in:query type:byte', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.byte('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
          format: 'byte',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.binary', () => {
    it('defines a parameter with in:query type:binary', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.binary('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
          format: 'binary',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.date', () => {
    it('defines a parameter with in:query type:date', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.date('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
          format: 'date',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.dateTime', () => {
    it('defines a parameter with in:query type:dateTime', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.dateTime('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
          format: 'date-time',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.password', () => {
    it('defines a parameter with in:query type:password', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.password('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
          format: 'password',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.query.object', () => {
    it('sets in:query style:deepObject and a default schema', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.object('filter') filter: object) {}
      }
      const expectedParamSpec = <ParameterObject>{
        name: 'filter',
        in: 'query',
        style: 'deepObject',
        explode: true,
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });

    it('supports user-defined schema', () => {
      class MyController {
        @get('/greet')
        greet(
          @param.query.object('filter', {
            type: 'object',
            properties: {
              where: {type: 'object', additionalProperties: true},
              limit: {type: 'number'},
            },
          })
          filter: object,
        ) {}
      }
      const expectedParamSpec: ParameterObject = {
        name: 'filter',
        in: 'query',
        style: 'deepObject',
        explode: true,
        schema: {
          type: 'object',
          properties: {
            where: {type: 'object', additionalProperties: true},
            limit: {type: 'number'},
          },
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  it('allows additional properties for parameter object', () => {
    class MyController {
      @get('/greet')
      greet(@param.query.string('name', {description: 'Name'}) name: string) {}
    }
    const expectedParamSpec = {
      name: 'name',
      in: 'query',
      description: 'Name',
      schema: {
        type: 'string',
      },
    };
    expectSpecToBeEqual(MyController, expectedParamSpec);
  });

  it('allows additional spec properties for @param.query.object', () => {
    class MyController {
      @get('/greet')
      greet(
        @param.query.object('filter', undefined, {
          description: 'Search criteria',
        })
        filter: object,
      ) {}
    }
    const expectedParamSpec = <ParameterObject>{
      name: 'filter',
      in: 'query',
      description: 'Search criteria',
      style: 'deepObject',
      explode: true,
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    };
    expectSpecToBeEqual(MyController, expectedParamSpec);
  });
});

function expectSpecToBeEqual(controller: Function, paramSpec: object) {
  const actualSpec = getControllerSpec(controller);
  expect(actualSpec.paths['/greet']['get'].parameters).to.eql([paramSpec]);
}
