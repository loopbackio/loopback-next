// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Class, MixinBuilder} from '../../';

// tslint:disable:no-any

class BaseClass {
  baseProp: string = 'baseProp';

  static staticMethod1(): string {
    return 'static';
  }

  method1() {}
}

function Mixin1<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    mixinProp1: string = 'mixinProp1';

    static staticMixinMethod1(): string {
      return 'mixin1.static';
    }

    mixinMethod1(): string {
      return 'mixin1';
    }
  };
}

function Mixin2<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    mixinProp2: string = 'mixinProp2';

    static staticMixinMethod2(): string {
      return 'mixin2.static';
    }

    mixinMethod2() {
      return 'mixin2';
    }
  };
}

describe('mixin builder', () => {
  let newClass: any;
  before(() => {
    newClass = MixinBuilder.mix(BaseClass).with(Mixin1, Mixin2);
  });

  it('allows multiple classes to be mixed in', () => {
    expect(newClass.staticMethod1).to.eql(BaseClass.staticMethod1);
    expect(newClass.prototype.method1).to.eql(BaseClass.prototype.method1);
    expect(newClass.staticMixinMethod1).to.not.null();
    expect(newClass.staticMixinMethod2).to.not.null();

    expect(newClass.staticMethod1()).to.eql('static');
    expect(newClass.staticMixinMethod1()).to.eql('mixin1.static');
    expect(newClass.staticMixinMethod2()).to.eql('mixin2.static');

    const x = new newClass();
    expect(typeof x.mixinMethod1).to.eql('function');
    expect(typeof x.mixinMethod2).to.eql('function');
    expect(x.mixinMethod1()).to.eql('mixin1');
    expect(x.mixinMethod2()).to.eql('mixin2');
    expect(x.mixinProp1).to.eql('mixinProp1');
    expect(x.mixinProp2).to.eql('mixinProp2');
  });

  it('allows inheritance', () => {
    const x = new newClass();
    expect(x instanceof BaseClass).to.true();
  });
});
