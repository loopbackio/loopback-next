// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Constructor,
  describeInjectedArguments,
  describeInjectedProperties,
  inject,
} from '../..';

describe('function argument injection', () => {
  it('can decorate class constructor arguments', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['foo']);
  });

  it('allows decorator to be explicitly invoked for class ctor args', () => {
    class TestClass {
      constructor(foo: string) {}
    }
    inject('foo')(TestClass, undefined, 0);

    const meta = describeInjectedArguments(TestClass);
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['foo']);
  });

  it('can retrieve information about injected method arguments', () => {
    class TestClass {
      test(@inject('foo') foo: string) {}
    }

    const meta = describeInjectedArguments(TestClass.prototype, 'test');
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['foo']);
  });

  it('can retrieve information about injected static method arguments', () => {
    class TestClass {
      static test(@inject('foo') foo: string) {}
    }

    const meta = describeInjectedArguments(TestClass, 'test');
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['foo']);
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
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['foo']);
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
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['bar']);
  });

  it('supports inheritance with overriding constructor - no args', () => {
    class TestClass {
      constructor(@inject('foo') foo: string) {}
    }

    class SubTestClass extends TestClass {
      constructor() {
        super('foo');
      }
    }
    const meta = describeInjectedArguments(SubTestClass);
    expect(meta.map(m => m.bindingSelector)).to.deepEqual([]);
  });

  // https://github.com/strongloop/loopback-next/issues/2946
  it('allows custom decorator that returns a new constructor', () => {
    class HelloController {
      name = 'Leonard';
    }

    const mixinDecorator = () => <C extends Constructor<object>>(
      baseConstructor: C,
    ) =>
      class extends baseConstructor {
        classProperty = 'a classProperty';
        classFunction() {
          return 'a classFunction';
        }
      };

    @mixinDecorator()
    class Test {
      constructor(@inject('controller') public controller: HelloController) {}
    }

    // Now the `Test` class looks like the following:
    /*
    class extends baseConstructor {
            constructor() {
                super(...arguments);
                this.classProperty = () => 'a classProperty';
            }
            classFunction() {
                return 'a classFunction';
            }
        }
    */

    const meta = describeInjectedArguments(Test);
    expect(meta.map(m => m.bindingSelector)).to.deepEqual(['controller']);
  });

  it('reports error if @inject is applied more than once', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestClass {
        constructor(@inject('foo') @inject('bar') foo: string) {}
      }
    }).to.throw(
      '@inject cannot be applied more than once on TestClass.constructor[0]',
    );
  });
});

describe('property injection', () => {
  it('can decorate properties', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestClass {
      @inject('foo')
      foo: string;
    }
    // the test passes when TypeScript Compiler is happy
  });

  it('can retrieve information about injected properties', () => {
    class TestClass {
      @inject('foo')
      foo: string;
    }

    const meta = describeInjectedProperties(TestClass.prototype);
    expect(meta.foo.bindingSelector).to.eql('foo');
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestClass {
        @inject('foo')
        static foo: string;
      }
    }).to.throw(/@inject is not supported for a static property/);
  });

  it('cannot decorate a method', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestClass {
        @inject('bar')
        foo() {}
      }
    }).to.throw(/@inject cannot be used on a method/);
  });

  it('reports error if @inject.* is applied more than once', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestClass {
        constructor() {}

        @inject.getter('foo') @inject('bar') foo: string;
      }
    }).to.throw(
      '@inject.getter cannot be applied more than once on TestClass.prototype.foo',
    );
  });

  it('supports inheritance without overriding property', () => {
    class TestClass {
      @inject('foo')
      foo: string;
    }

    class SubTestClass extends TestClass {}
    const meta = describeInjectedProperties(SubTestClass.prototype);
    expect(meta.foo.bindingSelector).to.eql('foo');
  });

  it('supports inheritance with overriding property', () => {
    class TestClass {
      @inject('foo')
      foo: string;
    }

    class SubTestClass extends TestClass {
      @inject('bar')
      foo: string;
    }

    const base = describeInjectedProperties(TestClass.prototype);
    expect(base.foo.bindingSelector).to.eql('foo');

    const sub = describeInjectedProperties(SubTestClass.prototype);
    expect(sub.foo.bindingSelector).to.eql('bar');
  });

  it('supports inherited and own properties', () => {
    class TestClass {
      @inject('foo')
      foo: string;
    }

    class SubTestClass extends TestClass {
      @inject('bar')
      bar: string;
    }
    const meta = describeInjectedProperties(SubTestClass.prototype);
    expect(meta.foo.bindingSelector).to.eql('foo');
    expect(meta.bar.bindingSelector).to.eql('bar');
  });

  it('does not clone metadata deeply', () => {
    const options = {x: 1};
    class TestClass {
      @inject('foo', options)
      foo: string;
    }
    const meta = describeInjectedProperties(TestClass.prototype);
    expect(meta.foo.metadata).to.be.not.exactly(options);
    expect(meta.foo.metadata).to.eql({x: 1, decorator: '@inject'});
  });
});
