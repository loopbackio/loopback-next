// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {BindingKey} from '../..';

describe('BindingKey', () => {
  describe('create', () => {
    it('creates a key with a binding key only', () => {
      expect(BindingKey.create('foo')).to.have.properties({
        key: 'foo',
        propertyPath: undefined,
      });
    });

    it('creates a key with a binding key and a property path', () => {
      expect(BindingKey.create('foo', 'port')).to.have.properties({
        key: 'foo',
        propertyPath: 'port',
      });
    });

    it('creates a key with a property path parsed from the key arg', () => {
      const keyString = BindingKey.create('foo', 'port').toString();
      expect(BindingKey.create(keyString)).to.have.properties({
        key: 'foo',
        propertyPath: 'port',
      });
    });

    it('rejects a key with an encoded path when the path arg is provided', () => {
      expect(() => BindingKey.create('foo#port', 'port')).to.throw(
        /Binding key.*cannot contain/,
      );
    });
  });

  describe('buildKeyWithPath', () => {
    it('composes address parts using correct separator', () => {
      expect(BindingKey.create('foo', 'bar').toString()).to.equal('foo#bar');
    });
  });

  describe('parseKeyWithPath', () => {
    it('parses key without path', () => {
      expect(BindingKey.parseKeyWithPath('foo')).to.have.properties({
        key: 'foo',
        propertyPath: undefined,
      });
    });

    it('parses key with path', () => {
      expect(BindingKey.parseKeyWithPath('foo#bar')).to.have.properties({
        key: 'foo',
        propertyPath: 'bar',
      });
    });
  });
});
