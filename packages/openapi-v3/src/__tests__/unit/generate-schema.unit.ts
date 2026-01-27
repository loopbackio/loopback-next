// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {resolveSchema} from '../../generate-schema';

describe('generate-schema unit tests', () => {
  it('returns an empty object given no arguments', () => {
    expect(resolveSchema()).to.eql({});
  });

  it('resolves type String', () => {
    expect(resolveSchema(String)).to.eql({type: 'string'});
  });

  it('resolves type Number', () => {
    expect(resolveSchema(Number)).to.eql({type: 'number'});
  });

  it('resolves type Boolean', () => {
    expect(resolveSchema(Boolean)).to.eql({type: 'boolean'});
  });

  it('resolves type Date', () => {
    expect(resolveSchema(Date)).to.eql({type: 'string', format: 'date-time'});
  });

  it('resolves type Object', () => {
    expect(resolveSchema(Object)).to.eql({type: 'object'});
  });

  it('resolves type Array', () => {
    expect(resolveSchema(Array)).to.eql({type: 'array'});
  });

  it('resolves type Class', () => {
    class MyModel {}
    expect(resolveSchema(MyModel)).to.eql({
      $ref: '#/components/schemas/MyModel',
    });
  });

  it('preserves existing schema properties', () => {
    const schema = {foo: 'bar'};
    expect(resolveSchema(String, schema)).to.eql({type: 'string', foo: 'bar'});
  });

  it('does not override existing format in schema', () => {
    const schema = {type: 'string' as const, format: 'email'};
    expect(resolveSchema(String, schema)).to.eql({
      type: 'string',
      format: 'email',
    });
  });

  it('merges resolved schema with existing properties', () => {
    const schema = {description: 'A test string', minLength: 5};
    expect(resolveSchema(String, schema)).to.eql({
      type: 'string',
      description: 'A test string',
      minLength: 5,
    });
  });

  it('handles custom class with specific name', () => {
    class UserModel {}
    expect(resolveSchema(UserModel)).to.eql({
      $ref: '#/components/schemas/UserModel',
    });
  });

  it('handles arrow function', () => {
    const fn = () => {};
    expect(resolveSchema(fn)).to.eql({
      $ref: '#/components/schemas/fn',
    });
  });

  it('preserves $ref when schema has existing properties', () => {
    class Product {}
    const schema = {description: 'A product'};
    expect(resolveSchema(Product, schema)).to.eql({
      $ref: '#/components/schemas/Product',
      description: 'A product',
    });
  });

  it('handles undefined function with existing schema', () => {
    const schema = {type: 'string' as const, description: 'Test'};
    expect(resolveSchema(undefined, schema)).to.eql({
      type: 'string',
      description: 'Test',
    });
  });

  it('handles null function with existing schema', () => {
    const schema = {type: 'number' as const};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSchema(null as any, schema)).to.eql({type: 'number'});
  });

  it('returns empty object for non-function types', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSchema('string' as any)).to.eql({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSchema(123 as any)).to.eql({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveSchema(true as any)).to.eql({});
  });

  it('handles schema with multiple properties for Date', () => {
    const schema = {description: 'Creation date', example: '2023-01-01'};
    expect(resolveSchema(Date, schema)).to.eql({
      type: 'string',
      format: 'date-time',
      description: 'Creation date',
      example: '2023-01-01',
    });
  });

  it('handles schema with multiple properties for Array', () => {
    const schema = {description: 'List of items', minItems: 1};
    expect(resolveSchema(Array, schema)).to.eql({
      type: 'array',
      description: 'List of items',
      minItems: 1,
    });
  });

  it('handles schema with multiple properties for Object', () => {
    const schema = {
      description: 'Configuration object',
      additionalProperties: false,
    };
    expect(resolveSchema(Object, schema)).to.eql({
      type: 'object',
      description: 'Configuration object',
      additionalProperties: false,
    });
  });

  it('handles schema with nullable property', () => {
    const schema = {nullable: true};
    expect(resolveSchema(String, schema)).to.eql({
      type: 'string',
      nullable: true,
    });
  });

  it('handles schema with enum values', () => {
    const schema = {enum: ['active', 'inactive']};
    expect(resolveSchema(String, schema)).to.eql({
      type: 'string',
      enum: ['active', 'inactive'],
    });
  });
});
