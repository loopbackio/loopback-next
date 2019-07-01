// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '../../expect';
import {toJSON} from '../../to-json';

describe('toJSON', () => {
  it('removes properties set to undefined', () => {
    const value = toJSON({
      title: 'a-todo-title',
      isComplete: undefined,
    });
    expectObjectValue(value, {
      title: 'a-todo-title',
    });
  });

  it('handles null', () => {
    const value = toJSON(null);
    expectNull(value);
  });

  it('handles undefined', () => {
    const value = toJSON(undefined);
    expectUndefined(value);
  });

  it('handles numbers', () => {
    const value = toJSON(123);
    expectNumericValue(value, 123);
  });

  it('handles strings', () => {
    const value = toJSON('text');
    expectStringValue(value, 'text');
  });

  it('handles booleans', () => {
    const value = toJSON(true);
    expectBooleanValue(value, true);
  });

  it('handles dates', () => {
    const value = toJSON(new Date('2018-01-01T00:00:00.000Z'));
    expectStringValue(value, '2018-01-01T00:00:00.000Z');
  });

  it('handles top-level arrays', () => {
    const value = toJSON([1, 'text']);
    expectArrayValue(value, [1, 'text']);
  });

  it('handles nested array', () => {
    const value = toJSON({items: ['pen', 'pencil']});
    expectObjectValue(value, {items: ['pen', 'pencil']});
  });

  it('handles functions', () => {
    const value = toJSON(function foo() {});
    expectUndefined(value);
  });

  it('handles `object | null`', () => {
    const input = createValueOfUnionType<object | null>({});
    const output = toJSON(input);
    expectComplexType<object | null>(output, input);
  });

  it('handles `object | undefined`', () => {
    const input = createValueOfUnionType<object | undefined>({});
    const output = toJSON(input);
    expectComplexType<object | undefined>(output, input);
  });

  it('handles `object | null | undefined`', () => {
    const input = createValueOfUnionType<object | null | undefined>({});
    const output = toJSON(input);
    expectComplexType<object | null | undefined>(output, input);
  });

  it('handles `unknown[] | null`', () => {
    const input = createValueOfUnionType<unknown[] | null>([]);
    const output = toJSON(input);
    expectComplexType<unknown[] | null>(output, input);
  });

  it('handles `unknown[] | undefined`', () => {
    const input = createValueOfUnionType<unknown[] | undefined>([]);
    const output = toJSON(input);
    expectComplexType<unknown[] | undefined>(output, input);
  });

  it('handles `unknown[] | null | undefined`', () => {
    const input = createValueOfUnionType<unknown[] | null | undefined>([]);
    const output = toJSON(input);
    expectComplexType<unknown[] | null | undefined>(output, input);
  });

  it('handles classes with custom toJSON', () => {
    class Customer {
      private __data: object;

      constructor(public id: string, public email: string) {
        this.__data = {id, email};
      }

      toJSON() {
        return {id: this.id, email: this.email};
      }
    }

    const value = toJSON(new Customer('an-id', 'test@example.com'));
    expectObjectValue(value, {id: 'an-id', email: 'test@example.com'});
    expect(value.constructor).to.equal(Object);
  });

  it('handles nested class instance with custom toJSON', () => {
    class Address {
      constructor(public street: string, public city: string) {}

      toJSON() {
        return {
          model: 'Address',
          street: this.street,
          city: this.city,
        };
      }
    }

    class Customer {
      constructor(public email: string, public address: Address) {}

      toJSON() {
        return {
          model: 'Customer',
          email: this.email,
          address: this.address,
        };
      }
    }

    const value = toJSON(
      new Customer(
        'test@example.com',
        new Address('10 Downing Street', 'London'),
      ),
    );

    expectObjectValue(value, {
      model: 'Customer',
      email: 'test@example.com',
      address: {
        model: 'Address',
        street: '10 Downing Street',
        city: 'London',
      },
    });

    expect(value.constructor).to.equal(Object);
    expect((value as Customer).address.constructor).to.equal(Object);
  });
});

// Helpers to enforce compile-time type checks

function expectStringValue(actual: string, expected: string) {
  expect(actual).to.equal(expected);
}

function expectNumericValue(actual: number, expected: number) {
  expect(actual).to.equal(expected);
}

function expectBooleanValue(actual: boolean, expected: boolean) {
  expect(actual).to.equal(expected);
}

function expectObjectValue(actual: object, expected: object) {
  expect(actual).to.deepEqual(expected);
}

function expectArrayValue<T>(actual: T[], expected: T[]) {
  expect(actual).to.deepEqual(expected);
}

function expectNull(actual: null) {
  expect(actual).to.be.null();
}

function expectUndefined(actual: undefined) {
  expect(actual).to.be.undefined();
}

function expectComplexType<T>(actual: T, expected: T) {
  expect(actual).to.deepEqual(expected);
}

// A helper to force TypeScript to treat the given value as of a union type,
// e.g. treat `{}` as `object | undefined | null`.
function createValueOfUnionType<T>(value: T): T {
  return value;
}
