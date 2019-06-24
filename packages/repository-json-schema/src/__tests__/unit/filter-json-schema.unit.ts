// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, Filter, hasMany, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import * as Ajv from 'ajv';
import {JsonSchema} from '../..';
import {
  getFilterJsonSchemaFor,
  getWhereJsonSchemaFor,
} from '../../filter-json-schema';

describe('getFilterJsonSchemaFor', () => {
  let ajv: Ajv.Ajv;
  let customerFilterSchema: JsonSchema;
  let orderFilterSchema: JsonSchema;

  beforeEach(() => {
    ajv = new Ajv();
    customerFilterSchema = getFilterJsonSchemaFor(Customer);
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

  it('describes "where" as an object', () => {
    const filter = {where: 'invalid-where'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors || []).to.containDeep([
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
    expect(ajv.errors || []).to.containDeep([
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
    expect(ajv.errors || []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.include',
        message: 'should be array',
      },
    ]);
  });

  it('leaves out "include" for models with no relations', () => {
    const filterProperties = Object.keys(orderFilterSchema.properties || {});
    expect(filterProperties).to.not.containEql('include');
  });

  it('describes "offset" as an integer', () => {
    const filter = {offset: 'invalid-offset'};
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ajv.validate(customerFilterSchema, filter);
    expect(ajv.errors || []).to.containDeep([
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
    expect(ajv.errors || []).to.containDeep([
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
    expect(ajv.errors || []).to.containDeep([
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
    expect(ajv.errors || []).to.containDeep([
      {
        keyword: 'type',
        dataPath: '.order',
        message: 'should be array',
      },
    ]);
  });

  function expectSchemaToAllowFilter<T>(schema: JsonSchema, value: T) {
    const isValid = ajv.validate(schema, value);
    const SUCCESS_MSG = 'Filter instance is valid according to Filter schema';
    const result = isValid ? SUCCESS_MSG : ajv.errorsText(ajv.errors!);
    expect(result).to.equal(SUCCESS_MSG);
  }
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
