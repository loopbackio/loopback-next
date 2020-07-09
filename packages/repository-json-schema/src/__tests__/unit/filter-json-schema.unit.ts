// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  Entity,
  Filter,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import Ajv from 'ajv';
import {JsonSchema} from '../..';
import {
  AnyScopeFilterSchema,
  getFieldsJsonSchemaFor,
  getFilterJsonSchemaFor,
  getScopeFilterJsonSchemaFor,
  getWhereJsonSchemaFor,
} from '../../filter-json-schema';

describe('getFilterJsonSchemaFor', () => {
  let ajv: Ajv.Ajv;
  let customerFilterSchema: JsonSchema;
  let customerFilterExcludingWhereSchema: JsonSchema;
  let customerFilterExcludingIncludeSchema: JsonSchema;
  let orderFilterSchema: JsonSchema;

  beforeEach(() => {
    ajv = new Ajv();
    customerFilterSchema = getFilterJsonSchemaFor(Customer);
    customerFilterExcludingWhereSchema = getFilterJsonSchemaFor(Customer, {
      exclude: ['where'],
    });
    customerFilterExcludingIncludeSchema = getFilterJsonSchemaFor(Customer, {
      exclude: ['include'],
    });
    orderFilterSchema = getFilterJsonSchemaFor(Order);
  });

  it('produces a valid schema', () => {
    const isValid = ajv.validateSchema(customerFilterSchema);

    const SUCCESS_MSG = 'Filter schema is a valid JSON Schema';
    const result = isValid ? SUCCESS_MSG : ajv.errorsText(ajv.errors!);
    expect(result).to.equal(SUCCESS_MSG);
  });

  it('allows an empty filter', () => {
    expectSchemaToAllowFilter(customerFilterSchema, {});
  });

  it('allows all top-level filter properties', () => {
    const filter: Required<Filter> = {
      where: {id: 1},
      fields: {id: true, name: true},
      include: [{relation: 'orders'}],
      offset: 0,
      limit: 10,
      order: ['id DESC'],
      skip: 0,
    };

    expectSchemaToAllowFilter(customerFilterSchema, filter);
  });

  it('disallows "where"', () => {
    const filter = {where: {name: 'John'}};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterExcludingWhereSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'additionalProperties',
        dataPath: '',
        schemaPath: '#/additionalProperties',
        params: {additionalProperty: 'where'},
        message: 'should NOT have additional properties',
      },
    ]);
  });

  it('disallows "include"', () => {
    const filter = {include: 'orders'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterExcludingIncludeSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'additionalProperties',
        dataPath: '',
        schemaPath: '#/additionalProperties',
        params: {additionalProperty: 'include'},
        message: 'should NOT have additional properties',
      },
    ]);
  });

  it('describes "where" as an object', () => {
    const filter = {where: 'invalid-where'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.where',
        message: 'should be object',
      },
    ]);
  });

  it('describes "fields" as an object', () => {
    const filter = {fields: 'invalid-fields'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.fields',
        message: 'should be object',
      },
    ]);
  });

  it('describes "include" as an array for models with relations', () => {
    const filter = {include: 'invalid-include'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.include',
        message: 'should be array',
      },
    ]);
  });

  it('leaves out "include" for models with no relations', () => {
    const filterProperties = Object.keys(orderFilterSchema.properties ?? {});
    expect(filterProperties).to.not.containEql('include');
  });

  it('describes "offset" as an integer', () => {
    const filter = {offset: 'invalid-offset'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.offset',
        message: 'should be integer',
      },
    ]);
  });

  it('describes "limit" as an integer', () => {
    const filter = {limit: 'invalid-limit'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.limit',
        message: 'should be integer',
      },
    ]);
  });

  it('describes "skip" as an integer', () => {
    const filter = {skip: 'invalid-skip'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.skip',
        message: 'should be integer',
      },
    ]);
  });

  it('describes "order" as an array', () => {
    const filter = {order: 'invalid-order'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors ?? []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.order',
        message: 'should be array',
      },
    ]);
  });

  it('returns "title" when no options were provided', () => {
    expect(orderFilterSchema.title).to.equal('Order.Filter');
  });

  it('returns "include.title" when no options were provided', () => {
    expect(customerFilterSchema.properties)
      .to.have.propertyByPath('include', 'title')
      .to.equal('Customer.IncludeFilter');
  });

  it('returns "include.items.title" when no options were provided', () => {
    expect(customerFilterSchema.properties)
      .to.have.propertyByPath('include', 'items', 'title')
      .to.equal('Customer.IncludeFilter.Items');
  });

  it('returns "scope.title" when no options were provided', () => {
    expect(customerFilterSchema.properties)
      .to.have.propertyByPath(
        'include',
        'items',
        'properties',
        'scope',
        'title',
      )
      .to.equal('Customer.ScopeFilter');
  });

  function expectSchemaToAllowFilter<T>(schema: JsonSchema, value: T) {
    const isValid = ajv.validate(schema, value);
    const SUCCESS_MSG = 'Filter instance is valid according to Filter schema';
    const result = isValid ? SUCCESS_MSG : ajv.errorsText(ajv.errors!);
    expect(result).to.equal(SUCCESS_MSG);
  }
});

describe('getFilterJsonSchemaFor - excluding where', () => {
  let customerFilterSchema: JsonSchema;

  it('excludes "where" using string[]', () => {
    customerFilterSchema = getFilterJsonSchemaFor(Customer, {
      exclude: ['where'],
    });
    expect(customerFilterSchema.properties).to.not.have.property('where');
  });

  it('excludes "where" using string', () => {
    customerFilterSchema = getFilterJsonSchemaFor(Customer, {
      exclude: 'where',
    });
    expect(customerFilterSchema.properties).to.not.have.property('where');
  });
});

describe('getFilterJsonSchemaFor - excluding include', () => {
  let customerFilterSchema: JsonSchema;

  it('excludes "include" using string[]', () => {
    customerFilterSchema = getFilterJsonSchemaFor(Customer, {
      exclude: ['include'],
    });
    expect(customerFilterSchema.properties).to.not.have.property('include');
  });

  it('excludes "include" using string', () => {
    customerFilterSchema = getFilterJsonSchemaFor(Customer, {
      exclude: 'include',
    });
    expect(customerFilterSchema.properties).to.not.have.property('include');
  });
});

describe('getFilterJsonSchemaForOptionsSetTitle', () => {
  let customerFilterSchema: JsonSchema;

  beforeEach(() => {
    customerFilterSchema = getFilterJsonSchemaFor(Customer, {setTitle: true});
  });

  it('returns "title" when a single option "setTitle" is set', () => {
    expect(customerFilterSchema.title).to.equal('Customer.Filter');
  });

  it('returns "include.title" when a single option "setTitle" is set', () => {
    expect(customerFilterSchema.properties)
      .to.have.propertyByPath('include', 'title')
      .to.equal('Customer.IncludeFilter');
  });

  it('returns "include.items.title" when a single option "setTitle" is set', () => {
    expect(customerFilterSchema.properties)
      .to.have.propertyByPath('include', 'items', 'title')
      .to.equal('Customer.IncludeFilter.Items');
  });

  it('returns "scope.title" when a single option "setTitle" is set', () => {
    expect(customerFilterSchema.properties)
      .to.have.propertyByPath(
        'include',
        'items',
        'properties',
        'scope',
        'title',
      )
      .to.equal('Customer.ScopeFilter');
  });
});

describe('getFilterJsonSchemaForOptionsUnsetTitle', () => {
  let customerFilterSchema: JsonSchema;

  beforeEach(() => {
    customerFilterSchema = getFilterJsonSchemaFor(Customer, {setTitle: false});
  });

  it('no title when a single option "setTitle" is false', () => {
    expect(customerFilterSchema).to.not.have.property('title');
  });

  it('no title on include when single option "setTitle" is false', () => {
    expect(customerFilterSchema.properties)
      .property('include')
      .to.not.have.property('title');
  });

  it('no title on include.items when single option "setTitle" is false', () => {
    expect(customerFilterSchema.properties)
      .propertyByPath('include', 'items')
      .to.not.have.property('title');
  });

  it('no title on scope when single option "setTitle" is false', () => {
    expect(customerFilterSchema.properties)
      .propertyByPath('include', 'items', 'properties', 'scope')
      .to.not.have.property('title');
  });
});

describe('getScopeFilterJsonSchemaFor - nested inclusion', () => {
  let todoListScopeSchema: JsonSchema;
  @model()
  class Todo extends Entity {
    @property({
      type: 'number',
      id: true,
      generated: false,
    })
    id: number;

    @belongsTo(() => TodoList)
    todoListId: number;
  }

  @model()
  class TodoList extends Entity {
    @property({
      type: 'number',
      id: true,
      generated: false,
    })
    id: number;

    @hasMany(() => Todo)
    todos: Todo[];
  }

  beforeEach(() => {
    todoListScopeSchema = getScopeFilterJsonSchemaFor(TodoList, {
      setTitle: false,
    });
  });

  it('does not have constraint for scope filter', () => {
    expect(todoListScopeSchema.properties)
      .propertyByPath('include')
      .to.containEql({
        ...AnyScopeFilterSchema,
      });
  });
});

describe('getWhereJsonSchemaFor', () => {
  let ajv: Ajv.Ajv;
  let customerWhereSchema: JsonSchema;

  beforeEach(() => {
    ajv = new Ajv();
    customerWhereSchema = getWhereJsonSchemaFor(Customer);
  });

  it('produces a valid schema', () => {
    const isValid = ajv.validateSchema(customerWhereSchema);

    const SUCCESS_MSG = 'Where schema is a valid JSON Schema';
    const result = isValid ? SUCCESS_MSG : ajv.errorsText(ajv.errors!);
    expect(result).to.equal(SUCCESS_MSG);
  });

  it('returns "title" when no options were provided', () => {
    expect(customerWhereSchema.title).to.equal('Customer.WhereFilter');
  });
});

describe('getWhereJsonSchemaForOptions', () => {
  let customerWhereSchema: JsonSchema;

  it('returns "title" when a single option "setTitle" is set', () => {
    customerWhereSchema = getWhereJsonSchemaFor(Customer, {
      setTitle: true,
    });
    expect(customerWhereSchema.title).to.equal('Customer.WhereFilter');
  });

  it('leaves out "title" when a single option "setTitle" is false', () => {
    customerWhereSchema = getWhereJsonSchemaFor(Customer, {
      setTitle: false,
    });
    expect(customerWhereSchema).to.not.have.property('title');
  });
});

describe('getFieldsJsonSchemaFor', () => {
  let customerFieldsSchema: JsonSchema;

  it('returns "title" when no options were provided', () => {
    customerFieldsSchema = getFieldsJsonSchemaFor(Customer);
    expect(customerFieldsSchema.title).to.equal('Customer.Fields');
  });

  it('returns "title" when a single option "setTitle" is set', () => {
    customerFieldsSchema = getFieldsJsonSchemaFor(Customer, {
      setTitle: true,
    });
    expect(customerFieldsSchema.title).to.equal('Customer.Fields');
  });

  it('leaves out "title" when a single option "setTitle" is false', () => {
    customerFieldsSchema = getFieldsJsonSchemaFor(Customer, {
      setTitle: false,
    });
    expect(customerFieldsSchema).to.not.have.property('title');
  });
});

describe('single option setTitle override original value', () => {
  let customerFieldsSchema: JsonSchema;

  it('returns builtin "title" when no options were provided', () => {
    customerFieldsSchema = {
      title: 'Test Title',
      ...getFieldsJsonSchemaFor(Customer),
    };
    expect(customerFieldsSchema.title).to.equal('Customer.Fields');
  });

  it('returns builtin "title" when a single option "setTitle" is set', () => {
    customerFieldsSchema = {
      title: 'Test Title',
      ...getFieldsJsonSchemaFor(Customer, {
        setTitle: true,
      }),
    };
    expect(customerFieldsSchema.title).to.equal('Customer.Fields');
  });

  it('returns original "title" when a single option "setTitle" is false', () => {
    customerFieldsSchema = {
      title: 'Test Title',
      ...getFieldsJsonSchemaFor(Customer, {
        setTitle: false,
      }),
    };
    expect(customerFieldsSchema.title).to.equal('Test Title');
  });
});

@model()
class Order extends Entity {
  @property({id: true})
  id: number;

  @property()
  customerId: number;
}

@model()
class Customer extends Entity {
  @property({id: true})
  id: number;

  @property()
  name: string;

  @hasMany(() => Order)
  orders?: Order[];
}
