// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  isBuiltinType,
  isTypeResolver,
  resolveType,
  TypeResolver,
} from '../../type-resolver';

class SomeModel {
  constructor(public name: string) {}
}

const A_DATE_STRING = '2018-01-01T00:00:00.000Z';

describe('isTypeResolver', () => {
  it('returns false when the arg is a class', () => {
    expect(isTypeResolver(SomeModel)).to.be.false();
  });

  it('returns false when the arg is not a function', () => {
    expect(isTypeResolver(123)).to.be.false();
  });

  it('returns false when the arg is String type', () => {
    expect(isTypeResolver(String)).to.be.false();
  });

  it('returns false when the arg is Number type', () => {
    expect(isTypeResolver(Number)).to.be.false();
  });

  it('returns false when the arg is Boolean type', () => {
    expect(isTypeResolver(Boolean)).to.be.false();
  });

  it('returns false when the arg is Object type', () => {
    expect(isTypeResolver(Object)).to.be.false();
  });

  it('returns false when the arg is Array type', () => {
    expect(isTypeResolver(Object)).to.be.false();
  });

  it('returns false when the arg is Date type', () => {
    expect(isTypeResolver(Date)).to.be.false();
  });

  it('returns false when the arg is RegExp type', () => {
    expect(isTypeResolver(RegExp)).to.be.false();
  });

  it('returns false when the arg is Buffer type', () => {
    expect(isTypeResolver(Buffer)).to.be.false();
  });

  it('returns true when the arg is any other function', () => {
    expect(isTypeResolver(() => SomeModel)).to.be.true();
  });
});

describe('resolveType', () => {
  it('resolves the arg when the value is a resolver', () => {
    const resolver: TypeResolver<SomeModel> = () => SomeModel;
    const ctor = resolveType(resolver);
    expect(ctor).to.eql(SomeModel);

    const inst = new ctor('a-name');
    expect(inst).to.have.property('name', 'a-name');
  });

  it('returns the arg when the value is a type', () => {
    const ctor = resolveType(SomeModel);
    expect(ctor).to.eql(SomeModel);

    const inst = new ctor('a-name');
    expect(inst).to.have.property('name', 'a-name');
  });

  it('supports Date type', () => {
    const ctor = resolveType(Date);
    expect(ctor).to.eql(Date);

    const inst = new ctor(A_DATE_STRING);
    expect(inst.toISOString()).to.equal(A_DATE_STRING);
  });

  it('supports Date resolver', () => {
    const ctor = resolveType(() => Date);
    expect(ctor).to.eql(Date);

    const inst = new ctor(A_DATE_STRING);
    expect(inst.toISOString()).to.equal(A_DATE_STRING);
  });
});

describe('isBuiltinType', () => {
  it('returns true for Number', () => {
    expect(isBuiltinType(Number)).to.eql(true);
  });

  it('returns true for String', () => {
    expect(isBuiltinType(String)).to.eql(true);
  });

  it('returns true for Boolean', () => {
    expect(isBuiltinType(Boolean)).to.eql(true);
  });

  it('returns true for Object', () => {
    expect(isBuiltinType(Object)).to.eql(true);
  });

  it('returns true for Function', () => {
    expect(isBuiltinType(Function)).to.eql(true);
  });

  it('returns true for Date', () => {
    expect(isBuiltinType(Date)).to.eql(true);
  });

  it('returns true for Array', () => {
    expect(isBuiltinType(Array)).to.eql(true);
  });

  it('returns false for any other function', () => {
    expect(isBuiltinType(SomeModel)).to.eql(false);
  });
});
