// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {get, getControllerSpec, param} from '../../../..';

describe('Routing metadata for parameters', () => {
  describe('@param.path.string', () => {
    it('defines a parameter with in:path type:string', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.string('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });

    it('allows additional spec properties with in:path type:string', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.string('name', {description: 'Name'}) name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        description: 'Name',
        required: true,
        schema: {
          type: 'string',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.number', () => {
    it('defines a parameter with in:path type:number', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.number('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'number',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.integer', () => {
    it('defines a parameter with in:path type:integer', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.integer('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          format: 'int32',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.boolean', () => {
    it('defines a parameter with in:path type:boolean', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.boolean('name') name: boolean) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'path',
          required: true,
          schema: {
            type: 'boolean',
          },
        },
      ]);
    });
  });

  describe('@param.path.long', () => {
    it('defines a parameter with in:path type:long', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.long('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          format: 'int64',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.float', () => {
    it('defines a parameter with in:path type:float', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.float('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'number',
          format: 'float',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.double', () => {
    it('defines a parameter with in:path type:double', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.double('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'number',
          format: 'double',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.byte', () => {
    it('defines a parameter with in:path type:byte', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.byte('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'byte',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.binary', () => {
    it('defines a parameter with in:path type:binary', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.binary('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'binary',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.date', () => {
    it('defines a parameter with in:path type:date', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.date('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'date',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.dateTime', () => {
    it('defines a parameter with in:path type:dateTime', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.dateTime('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'date-time',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.path.password', () => {
    it('defines a parameter with in:path type:password', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.password('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'password',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });
});

function expectSpecToBeEqual(controller: Function, paramSpec: object) {
  const actualSpec = getControllerSpec(controller);
  expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
    paramSpec,
  ]);
}
