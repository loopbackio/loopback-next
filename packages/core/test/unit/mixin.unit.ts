// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Class, MixinBuilder} from '../../';

interface ReturnType {
  name: string;
  value?: string;
}
// tslint:disable:no-any
class BaseClass {
  baseProp: string = 'baseProp';

  static staticBaseMethod(): string {
    return 'static';
  }

  baseMethod(): string {
    return 'base';
  }
  baseMethodWithReturnType(): ReturnType[] {
    return [{name: 'foo'}, {name: 'bar'}];
  }
}

function Mixin1<T extends Class<any>>(superClass: T): T {
  return class extends superClass {
    mixin1Prop: string = 'mixin1Prop';

    static staticMixin1Method(): string {
      return 'mixin1.static';
    }

    mixin1Method(): string {
      return 'mixin1';
    }

    mixin1WithReturnType(): ReturnType[] {
      return [{name: 'foo'}, {name: 'bar'}];
    }
  };
}

function Mixin2<T extends Class<any>>(superClass: T): T {
  return class extends superClass {
    mixin2Prop: string = 'mixin2Prop';

    static staticMixin2Method(): string {
      return 'mixin2.static';
    }

    mixin2Method() {
      return 'mixin2';
    }

    mixin2WithReturnType(): ReturnType[] {
      return [{name: 'foo'}, {name: 'bar'}];
    }
  };
}

describe('mixin builder', () => {
  let newClass: any;
  before(() => {
    newClass = MixinBuilder(BaseClass, [Mixin1, Mixin2]);
  });

  it('allows multiple classes to be mixed in', () => {
    expect(newClass.staticBaseMethod).to.eql(BaseClass.staticBaseMethod);
    expect(newClass.prototype.baseMethod).to.eql(
      BaseClass.prototype.baseMethod,
    );
    expect(newClass.staticMixin1Method).to.not.null();
    expect(newClass.staticMixin2Method).to.not.null();

    expect(newClass.staticBaseMethod()).to.eql('static');
    expect(newClass.staticMixin1Method()).to.eql('mixin1.static');
    expect(newClass.staticMixin2Method()).to.eql('mixin2.static');

    const x = new newClass();
    expect(typeof x.mixin1Method).to.eql('function');
    expect(typeof x.mixin2Method).to.eql('function');
    expect(x.mixin1Method()).to.eql('mixin1');
    expect(x.mixin2Method()).to.eql('mixin2');
    expect(x.mixin1Prop).to.eql('mixin1Prop');
    expect(x.mixin2Prop).to.eql('mixin2Prop');
  });

  it('allows inheritance', () => {
    const x = new newClass();
    expect(x instanceof BaseClass).to.true();
  });

  it('the extended class preserves the return type of method from base class', () => {
    class Y extends MixinBuilder(BaseClass, [Mixin1, Mixin2]) {}
    const y = new Y();
    expect(y.baseMethodWithReturnType().map(b => b.name)).to.eql([
      'foo',
      'bar',
    ]);
    expect(Y.staticBaseMethod()).to.eql('static');
    expect(y.mixin1Method()).to.eql('mixin1');
    expect(y.mixin2Method()).to.eql('mixin2');
    expect(y.baseProp).to.eql('baseProp');
    expect(y.mixin1Prop).to.eql('mixin1Prop');
    expect(y.mixin2Prop).to.eql('mixin2Prop');
    // The following 3 tests fail, the returned class doesn't preserve
    // the types of static/prototype methods from mixins
    // expect(Y.staticMixin1Method()).to.eql('mixin1.static');
    // expect(Y.staticMixin2Method()).to.eql('mixin2.static');
    // expect(y.mixin1WithReturnType().map(b => b.name)).to.eql(['foo', 'bar']);
  });
});
