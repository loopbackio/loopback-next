// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3-types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  isReferenceObject,
  isSchemaObject,
  ReferenceObject,
  SchemaObject,
} from '../..';

describe('type-guards unit tests', () => {
  describe('isSchemaObject()', () => {
    it('returns true for a schema object', () => {
      const schemaObject = new TestSchemaObject();
      expect(isSchemaObject(schemaObject)).to.be.True();
    });

    it('returns false for a reference object', () => {
      const referenceObject = new TestReferenceObject();
      expect(isSchemaObject(referenceObject)).to.be.False();
    });
  });

  describe('isReferenceObject()', () => {
    it('returns true for a reference object', () => {
      const referenceObject = new TestReferenceObject();
      expect(isReferenceObject(referenceObject)).to.be.True();
    });

    it('returns false for a schema object', () => {
      const schemaObject = new TestSchemaObject();
      expect(isReferenceObject(schemaObject)).to.be.False();
    });
  });

  class TestSchemaObject implements SchemaObject {}
  class TestReferenceObject implements ReferenceObject {
    $ref = 'test';
  }
});
