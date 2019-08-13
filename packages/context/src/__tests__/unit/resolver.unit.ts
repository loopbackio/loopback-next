// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  BindingAddress,
  Context,
  Getter,
  inject,
  Injection,
  instantiateClass,
  invokeMethod,
  ResolutionSession,
} from '../..';

describe('constructor injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').to('BAR');
  });

  it('resolves constructor arguments', () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.foo).to.eql('FOO');
  });

  it('allows non-injected arguments in constructor', () => {
    class TestClass {
      constructor(
        @inject('foo') public foo: string,
        public nonInjectedArg: string,
      ) {}
    }

    const theNonInjectedArg = 'BAZ';

    const test = instantiateClass(TestClass, ctx, undefined, [
      theNonInjectedArg,
    ]) as TestClass;
    expect(test.foo).to.eql('FOO');
    expect(test.nonInjectedArg).to.eql('BAZ');
  });

  it('can report error for missing binding key', () => {
    class TestClass {
      constructor(@inject('', {x: 'bar'}) public fooBar: string) {}
    }

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      instantiateClass(TestClass, ctx);
    }).to.throw(/Cannot resolve injected arguments/);
  });

  it('allows optional constructor injection', () => {
    class TestClass {
      constructor(
        @inject('optional-binding-key', {optional: true})
        public fooBar: string | undefined,
      ) {}
    }

    const test = instantiateClass(TestClass, ctx) as TestClass;
    expect(test.fooBar).to.be.undefined();
  });

  it('allows optional constructor injection with default value', () => {
    class TestClass {
      constructor(
        @inject('optional-binding-key', {optional: true})
        public fooBar: string = 'fooBar',
      ) {}
    }

    const test = instantiateClass(TestClass, ctx) as TestClass;
    expect(test.fooBar).to.be.eql('fooBar');
  });

  it('allows optional property injection with default value', () => {
    class TestClass {
      @inject('optional-binding-key', {optional: true})
      public fooBar = 'fooBar';
    }

    const test = instantiateClass(TestClass, ctx) as TestClass;
    expect(test.fooBar).to.be.eql('fooBar');
  });

  it('resolves constructor arguments with custom resolve function', () => {
    class TestClass {
      constructor(
        @inject('foo', {x: 'bar'}, (c: Context, injection: Injection) => {
          const barKey = injection.metadata.x;
          const b = c.getSync(barKey);
          const f = c.getSync(injection.bindingSelector as BindingAddress);
          return f + ':' + b;
        })
        public fooBar: string,
      ) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });

  it('resolves constructor arguments with custom resolve function and no binding key', () => {
    class TestClass {
      constructor(
        @inject('', {x: 'bar'}, (c: Context, injection: Injection) => {
          const barKey = injection.metadata.x;
          const b = c.getSync(barKey);
          return 'foo' + ':' + b;
        })
        public fooBar: string,
      ) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('foo:BAR');
  });

  it('resolves constructor arguments with custom decorator', () => {
    class TestClass {
      constructor(@customDecorator({x: 'bar'}) public fooBar: string) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });

  it('reports circular dependencies of two bindings', () => {
    const context = new Context();
    interface XInterface {}
    interface YInterface {}

    class XClass implements XInterface {
      @inject('y')
      public y: YInterface;
    }

    class YClass implements YInterface {
      @inject('x')
      public x: XInterface;
    }

    context.bind('x').toClass(XClass);
    context.bind('y').toClass(YClass);
    expect(() => context.getSync('x')).to.throw(
      'Circular dependency detected: x --> @XClass.prototype.y ' +
        '--> y --> @YClass.prototype.x --> x',
    );
    expect(() => context.getSync('y')).to.throw(
      'Circular dependency detected: y --> @YClass.prototype.x ' +
        '--> x --> @XClass.prototype.y --> y',
    );
  });

  it('reports circular dependencies of three bindings', () => {
    const context = new Context();

    // Declare interfaces so that they can be used for typing
    interface XInterface {}
    interface YInterface {}
    interface ZInterface {}

    class XClass {
      constructor(@inject('y') public y: YInterface) {}
    }

    class YClass {
      constructor(@inject('z') public z: ZInterface) {}
    }

    class ZClass {
      constructor(@inject('x') public x: XInterface) {}
    }

    context.bind('x').toClass(XClass);
    context.bind('y').toClass(YClass);
    context.bind('z').toClass(ZClass);
    expect(() => context.getSync('x')).to.throw(
      'Circular dependency detected: x --> @XClass.constructor[0] --> y ' +
        '--> @YClass.constructor[0] --> z --> @ZClass.constructor[0] --> x',
    );
    expect(() => context.getSync('y')).to.throw(
      'Circular dependency detected: y --> @YClass.constructor[0] --> z ' +
        '--> @ZClass.constructor[0] --> x --> @XClass.constructor[0] --> y',
    );
    expect(() => context.getSync('z')).to.throw(
      'Circular dependency detected: z --> @ZClass.constructor[0] --> x ' +
        '--> @XClass.constructor[0] --> y --> @YClass.constructor[0] --> z',
    );
  });

  it('will not report circular dependencies if a binding is injected twice', () => {
    const context = new Context();
    class XClass {}

    class YClass {
      constructor(
        @inject('x') public a: XClass,
        @inject('x') public b: XClass,
      ) {}
    }

    context.bind('x').toClass(XClass);
    context.bind('y').toClass(YClass);
    const y: YClass = context.getSync('y');
    expect(y.a).to.be.instanceof(XClass);
    expect(y.b).to.be.instanceof(XClass);
  });

  it('tracks path of bindings', () => {
    const context = new Context();
    let bindingPath = '';
    let resolutionPath = '';

    class ZClass {
      @inject(
        'p',
        {},
        // Set up a custom resolve() to access information from the session
        (c: Context, injection: Injection, session: ResolutionSession) => {
          bindingPath = session.getBindingPath();
          resolutionPath = session.getResolutionPath();
        },
      )
      myProp: string;
    }

    class YClass {
      constructor(@inject('z') public z: ZClass) {}
    }

    class XClass {
      constructor(@inject('y') public y: YClass) {}
    }

    context.bind('x').toClass(XClass);
    context.bind('y').toClass(YClass);
    context.bind('z').toClass(ZClass);
    context.getSync('x');
    expect(bindingPath).to.eql('x --> y --> z');
    expect(resolutionPath).to.eql(
      'x --> @XClass.constructor[0] --> y --> @YClass.constructor[0]' +
        ' --> z --> @ZClass.prototype.myProp',
    );
  });

  it('tracks path of bindings for @inject.getter', async () => {
    const context = new Context();
    let bindingPath = '';
    let resolutionPath = '';
    let decorators: (string | undefined)[] = [];

    class ZClass {
      @inject(
        'p',
        {},
        // Set up a custom resolve() to access information from the session
        (c: Context, injection: Injection, session: ResolutionSession) => {
          bindingPath = session.getBindingPath();
          resolutionPath = session.getResolutionPath();
          decorators = session.injectionStack.map(i => i.metadata.decorator);
        },
      )
      myProp: string;
    }

    class YClass {
      constructor(@inject.getter('z') public z: Getter<ZClass>) {}
    }

    class XClass {
      constructor(@inject('y') public y: YClass) {}
    }

    context.bind('x').toClass(XClass);
    context.bind('y').toClass(YClass);
    context.bind('z').toClass(ZClass);
    const x: XClass = context.getSync('x');
    await x.y.z();
    expect(bindingPath).to.eql('x --> y --> z');
    expect(resolutionPath).to.eql(
      'x --> @XClass.constructor[0] --> y --> @YClass.constructor[0]' +
        ' --> z --> @ZClass.prototype.myProp',
    );
    expect(decorators).to.eql(['@inject', '@inject.getter', '@inject']);
  });

  it('tracks path of injections', () => {
    const context = new Context();
    let injectionPath = '';

    class ZClass {
      @inject(
        'p',
        {},
        // Set up a custom resolve() to access information from the session
        (c: Context, injection: Injection, session: ResolutionSession) => {
          injectionPath = session.getInjectionPath();
        },
      )
      myProp: string;
    }

    class YClass {
      constructor(@inject('z') public z: ZClass) {}
    }

    class XClass {
      constructor(@inject('y') public y: YClass) {}
    }

    context.bind('x').toClass(XClass);
    context.bind('y').toClass(YClass);
    context.bind('z').toClass(ZClass);
    context.getSync('x');
    expect(injectionPath).to.eql(
      'XClass.constructor[0] --> YClass.constructor[0] --> ZClass.prototype.myProp',
    );
  });
});

describe('async constructor injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').toDynamicValue(() => Promise.resolve('FOO'));
    ctx.bind('bar').toDynamicValue(() => Promise.resolve('BAR'));
  });

  it('resolves constructor arguments', async () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
  });

  it('resolves constructor arguments with custom async decorator', async () => {
    class TestClass {
      constructor(@customAsyncDecorator({x: 'bar'}) public fooBar: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.fooBar).to.eql('FOO:BAR');
  });
});

describe('property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').to('BAR');
  });

  it('resolves injected properties', () => {
    class TestClass {
      @inject('foo')
      foo: string;
    }
    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.foo).to.eql('FOO');
  });

  it('can report error for missing binding key', () => {
    class TestClass {
      @inject('', {x: 'bar'})
      public fooBar: string;
    }

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      instantiateClass(TestClass, ctx);
    }).to.throw(/Cannot resolve injected property/);
  });

  it('resolves injected properties with custom resolve function', () => {
    class TestClass {
      @inject('foo', {x: 'bar'}, (c: Context, injection: Injection) => {
        const barKey = injection.metadata.x;
        const b = c.getSync(barKey);
        const f = c.getSync(injection.bindingSelector as BindingAddress);
        return f + ':' + b;
      })
      public fooBar: string;
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });

  it('resolves inject properties with custom resolve function and no binding key', () => {
    class TestClass {
      @inject('', {x: 'bar'}, (c: Context, injection: Injection) => {
        const barKey = injection.metadata.x;
        const b = c.getSync(barKey);
        return 'foo' + ':' + b;
      })
      public fooBar: string;
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('foo:BAR');
  });

  it('resolves injected properties with custom decorator', () => {
    class TestClass {
      @customDecorator({x: 'bar'})
      public fooBar: string;
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });
});

describe('async property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').toDynamicValue(() => Promise.resolve('FOO'));
    ctx.bind('bar').toDynamicValue(() => Promise.resolve('BAR'));
  });

  it('resolves injected properties', async () => {
    class TestClass {
      @inject('foo')
      foo: string;
    }
    const t: TestClass = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
  });

  it('resolves properties with custom async decorator', async () => {
    class TestClass {
      @customAsyncDecorator({x: 'bar'})
      public fooBar: string;
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.fooBar).to.eql('FOO:BAR');
  });
});

describe('dependency injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').to('BAR');
  });

  it('resolves properties and constructor arguments', () => {
    class TestClass {
      @inject('bar')
      bar: string;

      constructor(@inject('foo') public foo: string) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.foo).to.eql('FOO');
    expect(t.bar).to.eql('BAR');
  });
});

describe('async dependency injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').toDynamicValue(() => Promise.resolve('FOO'));
    ctx.bind('bar').toDynamicValue(() => Promise.resolve('BAR'));
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar')
      bar: string;

      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
    expect(t.bar).to.eql('BAR');
  });
});

describe('async constructor & sync property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').toDynamicValue(() => Promise.resolve('FOO'));
    ctx.bind('bar').to('BAR');
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar')
      bar: string;

      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
    expect(t.bar).to.eql('BAR');
  });
});

describe('async constructor injection with errors', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').toDynamicValue(
      () =>
        new Promise((resolve, reject) => {
          setImmediate(() => {
            reject(new Error('foo: error'));
          });
        }),
    );
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {}
    }

    await expect(instantiateClass(TestClass, ctx)).to.be.rejectedWith(
      'foo: error',
    );
  });
});

describe('async property injection with errors', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('bar').toDynamicValue(async () => {
      throw new Error('bar: error');
    });
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar')
      bar: string;
    }

    await expect(instantiateClass(TestClass, ctx)).to.be.rejectedWith(
      'bar: error',
    );
  });
});

describe('sync constructor & async property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').toDynamicValue(() => Promise.resolve('BAR'));
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar')
      bar: string;

      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
    expect(t.bar).to.eql('BAR');
  });
});

function customDecorator(def: object) {
  return inject('foo', def, (c: Context, injection: Injection) => {
    const barKey = injection.metadata.x;
    const b = c.getSync(barKey);
    const f = c.getSync(injection.bindingSelector as BindingAddress);
    return f + ':' + b;
  });
}

function customAsyncDecorator(def: object) {
  return inject('foo', def, async (c: Context, injection: Injection) => {
    const barKey = injection.metadata.x;
    const b = await c.get(barKey);
    const f = await c.get(injection.bindingSelector as BindingAddress);
    return f + ':' + b;
  });
}

describe('method injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').to('BAR');
  });

  it('resolves method arguments for the prototype', () => {
    let savedInstance;
    class TestClass {
      test(@inject('foo') foo: string) {
        savedInstance = this;
        return `hello ${foo}`;
      }
    }

    const t = invokeMethod(TestClass.prototype, 'test', ctx);
    expect(savedInstance).to.exactly(TestClass.prototype);
    expect(t).to.eql('hello FOO');
  });

  it('resolves method arguments for a given instance', () => {
    let savedInstance;
    class TestClass {
      bar: string;

      test(@inject('foo') foo: string) {
        savedInstance = this;
        this.bar = foo;
        return `hello ${foo}`;
      }
    }

    const inst = new TestClass();
    const t = invokeMethod(inst, 'test', ctx);
    expect(savedInstance).to.exactly(inst);
    expect(t).to.eql('hello FOO');
    expect(inst.bar).to.eql('FOO');
  });

  it('reports error for missing binding key', () => {
    class TestClass {
      test(@inject('key-does-not-exist') fooBar: string) {}
    }

    expect(() => {
      invokeMethod(TestClass.prototype, 'test', ctx);
    }).to.throw(/The key .+ is not bound to any value/);
  });

  it('resolves arguments for a static method', () => {
    class TestClass {
      static test(@inject('foo') fooBar: string) {
        return `Hello, ${fooBar}`;
      }
    }

    const msg = invokeMethod(TestClass, 'test', ctx);
    expect(msg).to.eql('Hello, FOO');
  });
});

describe('async method injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').toDynamicValue(() => Promise.resolve('FOO'));
    ctx.bind('bar').toDynamicValue(() => Promise.resolve('BAR'));
  });

  it('resolves arguments for a prototype method', async () => {
    class TestClass {
      test(@inject('foo') foo: string) {
        return `hello ${foo}`;
      }
    }

    const t = await invokeMethod(TestClass.prototype, 'test', ctx);
    expect(t).to.eql('hello FOO');
  });

  it('resolves arguments for a prototype method with an instance', async () => {
    class TestClass {
      bar: string;

      test(@inject('foo') foo: string) {
        this.bar = foo;
        return `hello ${foo}`;
      }
    }

    const inst = new TestClass();
    const t = await invokeMethod(inst, 'test', ctx);
    expect(t).to.eql('hello FOO');
    expect(inst.bar).to.eql('FOO');
  });

  it('resolves arguments for a method that returns a promise', async () => {
    let savedInstance;
    class TestClass {
      bar: string;

      test(@inject('foo') foo: string) {
        savedInstance = this;
        this.bar = foo;
        return Promise.resolve(`hello ${foo}`);
      }
    }

    const inst = new TestClass();
    const t = await invokeMethod(inst, 'test', ctx);
    expect(savedInstance).to.exactly(inst);
    expect(t).to.eql('hello FOO');
    expect(inst.bar).to.eql('FOO');
  });
});
