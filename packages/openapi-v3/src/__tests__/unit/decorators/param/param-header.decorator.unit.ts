// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {get, getControllerSpec, param} from '../../../..';

describe('Routing metadata for parameters', () => {
  describe('@param.header.string', () => {
    it('defines a parameter with in:header type:string', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.string('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'string',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });

    it('allows additional spec properties with in:header type:string', () => {
      class MyController {
        @get('/greet')
        greet(
          @param.header.string('name', {description: 'Name'}) name: string,
        ) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        description: 'Name',
        schema: {
          type: 'string',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.number', () => {
    it('defines a parameter with in:header type:number', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.number('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'number',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.integer', () => {
    it('defines a parameter with in:header type:integer', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.integer('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'integer',
          format: 'int32',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.boolean', () => {
    it('defines a parameter with in:header type:boolean', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.boolean('name') name: boolean) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'boolean',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.long', () => {
    it('defines a parameter with in:header type:long', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.long('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'integer',
          format: 'int64',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.float', () => {
    it('defines a parameter with in:header type:float', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.float('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'number',
          format: 'float',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.double', () => {
    it('defines a parameter with in:header type:double', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.double('name') name: number) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'number',
          format: 'double',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.byte', () => {
    it('defines a parameter with in:header type:byte', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.byte('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'string',
          format: 'byte',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.binary', () => {
    it('defines a parameter with in:header type:binary', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.binary('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'string',
          format: 'binary',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.date', () => {
    it('defines a parameter with in:header type:date', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.date('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'string',
          format: 'date',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.dateTime', () => {
    it('defines a parameter with in:header type:dateTime', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.dateTime('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
        schema: {
          type: 'string',
          format: 'date-time',
        },
      };
      expectSpecToBeEqual(MyController, expectedParamSpec);
    });
  });

  describe('@param.header.password', () => {
    it('defines a parameter with in:header type:password', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.password('name') name: string) {}
      }
      const expectedParamSpec = {
        name: 'name',
        in: 'header',
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
  expect(actualSpec.paths['/greet']['get'].parameters).to.eql([paramSpec]);
}
