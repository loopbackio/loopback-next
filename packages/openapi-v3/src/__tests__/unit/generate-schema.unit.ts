// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3.
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
});
