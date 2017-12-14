// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  inject,
  describeInjectedArguments,
  describeInjectedProperties,
} from '../..';

describe('function argument injection', () => {
  it('can decorate class constructor arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    class TestClass {
      constructor(@inject('foo') foo: string) {}
    }
    // the test passes when TypeScript Compiler is happy
  });

  it('can retrieve information about injected constructor arguments', () => {
    class TestClass {
      constructor(@inject('foo') foo: string) {}
    }

    const meta = describeInjectedArguments(TestClass);
    expect(meta.map(m => m.bindingKey)).to.deepEqual(['foo']);
  });

  it('can retrieve information about injected method arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    class TestClass {
      test(@inject('foo') foo: string) {}
    }

    const meta = describeInjectedArguments(TestClass.prototype, 'test');
    expect(meta.map(m => m.bindingKey)).to.deepEqual(['foo']);
  });

  it('can retrieve information about injected static method arguments', () => {
    class TestClass {
      static test(@inject('foo') foo: string) {}
    }

    const meta = describeInjectedArguments(TestClass, 'test');
    expect(meta.map(m => m.bindingKey)).to.deepEqual(['foo']);
  });

  it('returns an empty array when no ctor arguments are decorated', () => {
    class TestClass {
      constructor(foo: string) {}
    }

    const meta = describeInjectedArguments(TestClass);
    expect(meta).to.deepEqual([]);
  });

  it('supports inheritance without overriding constructor', () => {
    class TestClass {
      constructor(@inject('foo') foo: string) {}
    }

    class SubTestClass extends TestClass {}
    const meta = describeInjectedArguments(SubTestClass);
    expect(meta.map(m => m.bindingKey)).to.deepEqual(['foo']);
  });

  it('supports inheritance with overriding constructor', () => {
    class TestClass {
      constructor(@inject('foo') foo: string) {}
    }

    class SubTestClass extends TestClass {
      constructor(@inject('bar') foo: string) {
        super(foo);
      }
    }
    const meta = describeInjectedArguments(SubTestClass);
    expect(meta.map(m => m.bindingKey)).to.deepEqual(['bar']);
  });
});

describe('property injection', () => {
  it('can decorate properties', () => {
    // tslint:disable-next-line:no-unused-variable
    class TestClass {
      @inject('foo') foo: string;
    }
    // the test passes when TypeScript Compiler is happy
  });

  it('can retrieve information about injected properties', () => {
    class TestClass {
      @inject('foo') foo: string;
    }

    const meta = describeInjectedProperties(TestClass.prototype);
    expect(meta.foo.bindingKey).to.eql('foo');
  });

  it('returns an empty object when no properties are decorated', () => {
    class TestClass {
      foo: string;
    }

    const meta = describeInjectedProperties(TestClass.prototype);
    expect(meta).to.deepEqual({});
  });

  it('cannot decorate static properties', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class TestClass {
        @inject('foo') static foo: string;
      }
    }).to.throw(/@inject is not supported for a static property/);
  });

  it('cannot decorate a method', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class TestClass {
        @inject('bar')
        foo() {}
      }
    }).to.throw(/@inject cannot be used on a method/);
  });

  it('supports inheritance without overriding property', () => {
    class TestClass {
      @inject('foo') foo: string;
    }

    class SubTestClass extends TestClass {}
    const meta = describeInjectedProperties(SubTestClass.prototype);
    expect(meta.foo.bindingKey).to.eql('foo');
  });

  it('supports inheritance with overriding property', () => {
    class TestClass {
      @inject('foo') foo: string;
    }

    class SubTestClass extends TestClass {
      @inject('bar') foo: string;
    }
    const meta = describeInjectedProperties(SubTestClass.prototype);
    expect(meta.foo.bindingKey).to.eql('bar');
  });

  it('supports inherited and own properties', () => {
    class TestClass {
      @inject('foo') foo: string;
    }

    class SubTestClass extends TestClass {
      @inject('bar') bar: string;
    }
    const meta = describeInjectedProperties(SubTestClass.prototype);
    expect(meta.foo.bindingKey).to.eql('foo');
    expect(meta.bar.bindingKey).to.eql('bar');
  });
});
