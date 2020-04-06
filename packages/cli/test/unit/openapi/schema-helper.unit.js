// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const {mapSchemaType} = require('../../../generators/openapi/schema-helper');

function expectMapping(schema, expectedJSType, options) {
  const jsType = mapSchemaType(schema, options).signature;
  expect(jsType).to.equal(expectedJSType);
}

describe('primitive types', () => {
  it('maps integer', () => {
    expectMapping({type: 'integer'}, 'number');
  });

  it('maps int32 integer', () => {
    expectMapping({type: 'integer', format: 'int32'}, 'number');
  });

  it('maps int64 integer', () => {
    expectMapping({type: 'integer', format: 'int64'}, 'number');
  });

  it('maps float', () => {
    expectMapping({type: 'number', format: 'float'}, 'number');
  });

  it('maps double', () => {
    expectMapping({type: 'number', format: 'double'}, 'number');
  });

  it('maps boolean', () => {
    expectMapping({type: 'boolean'}, 'boolean');
  });

  it('maps string', () => {
    expectMapping({type: 'string'}, 'string');
  });

  it('maps date', () => {
    expectMapping({type: 'string', format: 'date'}, 'string');
  });

  it('maps date-time', () => {
    expectMapping({type: 'string', format: 'date-time'}, 'Date');
  });

  it('maps password', () => {
    expectMapping({type: 'string', format: 'password'}, 'string');
  });

  it('maps byte', () => {
    expectMapping({type: 'string', format: 'byte'}, 'string');
  });

  it('maps binary', () => {
    expectMapping({type: 'string', format: 'binary'}, 'Buffer');
  });
});

describe('primitive types with default', () => {
  it('maps integer', () => {
    expectMapping({type: 'integer', default: 10}, 'number = 10', {
      includeDefault: true,
    });
  });

  it('maps string', () => {
    expectMapping({type: 'string', default: 'ABC'}, "string = 'ABC'", {
      includeDefault: true,
    });
  });

  it('maps boolean', () => {
    expectMapping({type: 'boolean', default: false}, 'boolean = false', {
      includeDefault: true,
    });
  });
});

describe('primitive types with enum', () => {
  it('maps integer', () => {
    expectMapping({type: 'integer', enum: [1, 2], default: 2}, '1 | 2');
  });

  it('maps string', () => {
    expectMapping({type: 'string', enum: ['A', 'B', 'C']}, "'A' | 'B' | 'C'");
  });
});

describe('array types', () => {
  it('maps integer array', () => {
    expectMapping({type: 'array', items: {type: 'integer'}}, 'number[]');
  });

  it('maps number array', () => {
    expectMapping({type: 'array', items: {type: 'number'}}, 'number[]');
  });

  it('maps string array', () => {
    expectMapping({type: 'array', items: {type: 'string'}}, 'string[]');
  });

  it('maps boolean array', () => {
    expectMapping({type: 'array', items: {type: 'boolean'}}, 'boolean[]');
  });
});

describe('object types', () => {
  it('maps object', () => {
    expectMapping(
      {
        type: 'object',
        properties: {
          id: {type: 'number'},
          firstName: {type: 'string'},
          lastName: {type: 'string'},
          email: {type: 'string'},
          created: {type: 'string', format: 'date-time'},
          vip: {type: 'boolean', default: false},
        },
        required: ['id', 'email'],
      },
      `{
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  created?: Date;
  vip?: boolean;
}`,
    );
  });

  it('maps same schema object to the same type', () => {
    const schemas = {
      Customer: {
        type: 'object',
        properties: {
          id: {type: 'number'},
          firstName: {type: 'string'},
          lastName: {type: 'string'},
          email: {type: 'string'},
          created: {type: 'string', format: 'date-time'},
          vip: {type: 'boolean', default: false},
        },
        required: ['id', 'email'],
      },
    };
    const options = {
      objectTypeMapping: new Map(),
    };
    options.objectTypeMapping.set(schemas.Customer, {
      name: 'Customer',
      className: 'Customer',
    });
    expectMapping(schemas.Customer, 'Customer', options);
  });
});

describe('composite types', () => {
  it('maps oneOf', () => {
    expectMapping(
      {oneOf: [{type: 'string'}, {type: 'number'}]},
      'string | number',
    );
  });

  it('maps anyOf', () => {
    expectMapping(
      {anyOf: [{type: 'string'}, {type: 'number'}]},
      'string | number',
    );
  });

  it('maps allOf', () => {
    expectMapping(
      {allOf: [{type: 'string'}, {type: 'number'}]},
      'string & number',
    );
  });
});
