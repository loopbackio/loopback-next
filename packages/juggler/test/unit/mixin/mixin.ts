// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {MixinBuilder, Constructor} from '../../../lib/mixin';

class BaseClass {
  baseProp: string = 'baseProp';

  static staticMethod1(): string {
    return 'static';
  }

  method1() {
  }
}

function Mixin1(superClass: Constructor) {
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

function Mixin2(superClass: Constructor) {
  return class extends superClass {
    mixinProp2: string = 'mixinProp2';

    static staticMixinMethod2(): string {
      return 'mixin2.static';
    }

    mixinMethod2() {
      return 'mixin2';
    }
  }
}

describe('mixin builder', () => {
  let newClass;
  before(() => {
    newClass = MixinBuilder.mix(BaseClass).with(Mixin1, Mixin2);
  });

  it('allows multiple classes to be mixed in', () => {
    expect(newClass.staticMethod1).to.eq(BaseClass.staticMethod1);
    expect(newClass.prototype.method1).to.eq(BaseClass.prototype.method1);
    expect(newClass.staticMixinMethod1).to.exist();
    expect(newClass.staticMixinMethod2).to.exist();

    expect(newClass.staticMethod1()).to.eq('static');
    expect(newClass.staticMixinMethod1()).to.eq('mixin1.static');
    expect(newClass.staticMixinMethod2()).to.eq('mixin2.static');

    let x = new newClass();
    expect(typeof x.mixinMethod1).to.eq('function');
    expect(typeof x.mixinMethod2).to.eq('function');
    expect(x.mixinMethod1()).to.eq('mixin1');
    expect(x.mixinMethod2()).to.eq('mixin2');
    expect(x.mixinProp1).to.eq('mixinProp1');
    expect(x.mixinProp2).to.eq('mixinProp2');
  });

  it('allows inheritance', () => {
    let x = new newClass();
    expect(x instanceof BaseClass).to.true();
  });

});
