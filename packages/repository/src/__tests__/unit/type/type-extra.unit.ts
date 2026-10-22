// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {BufferType, ObjectType} from '../../../';

describe('BufferType', () => {
  const bufferType = new BufferType();

  describe('coerce()', () => {
    it('uses the provided options.encoding when options is given', () => {
      const result = bufferType.coerce('68656c6c6f', {encoding: 'hex'});
      // 0x68=h, 0x65=e, 0x6c=l, 0x6c=l, 0x6f=o
      expect(result.toString('utf-8')).to.equal('hello');
    });
  });
});

describe('ObjectType', () => {
  class Point {
    constructor(
      public x: number = 0,
      public y: number = 0,
    ) {}

    toJSON() {
      return {x: this.x, y: this.y, serialized: true};
    }
  }

  const objectType = new ObjectType(Point);

  describe('coerce()', () => {
    it('returns the value as-is when it is already an instance of the type', () => {
      const pt = new Point(1, 2);
      const result = objectType.coerce(pt);
      // Same reference — no new allocation
      expect(result).to.exactly(pt);
    });

    it('throws TypeError for a primitive value', () => {
      expect(() => objectType.coerce(42)).to.throwError(/Invalid object/);
    });

    it('throws TypeError for an array value', () => {
      expect(() => objectType.coerce([1, 2])).to.throwError(/Invalid object/);
    });
  });

  describe('serialize()', () => {
    it('calls toJSON() when the value has a toJSON method', () => {
      const pt = new Point(3, 4);
      const result = objectType.serialize(pt);
      expect(result).to.deepEqual({x: 3, y: 4, serialized: true});
    });

    it('returns the value directly when it has no toJSON method', () => {
      // ObjectType with a plain class that has no toJSON
      class Plain {
        constructor(public val: number = 0) {}
      }
      const plainType = new ObjectType(Plain);
      const obj = new Plain(7);
      const result = plainType.serialize(obj);
      expect(result).to.exactly(obj);
    });

    it('returns null/undefined as-is', () => {
      expect(objectType.serialize(null)).to.be.null();
      expect(objectType.serialize(undefined)).to.be.undefined();
    });
  });
});
