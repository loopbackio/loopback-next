// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Context,
  inject,
  instantiateClass,
  invokeMethod,
  Injection,
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

  it('can report error for missing binding key', () => {
    class TestClass {
      constructor(
        @inject('', {x: 'bar'})
        public fooBar: string,
      ) {}
    }

    expect(() => {
      instantiateClass(TestClass, ctx);
    }).to.throw(/Cannot resolve injected arguments/);
  });

  it('resolves constructor arguments with custom resolve function', () => {
    class TestClass {
      constructor(
        @inject('foo', {x: 'bar'}, (c: Context, injection: Injection) => {
          const barKey = injection.metadata && injection.metadata.x;
          const b = c.getSync(barKey);
          const f = c.getSync(injection.bindingKey);
          return f + ':' + b;
        })
        public fooBar: string,
      ) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });

  // tslint:disable-next-line:max-line-length
  it('resolves constructor arguments with custom resolve function and no binding key', () => {
    class TestClass {
      constructor(
        @inject('', {x: 'bar'}, (c: Context, injection: Injection) => {
          const barKey = injection.metadata && injection.metadata.x;
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
      constructor(
        @customDecorator({x: 'bar'})
        public fooBar: string,
      ) {}
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });
});

describe('async constructor injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to(Promise.resolve('FOO'));
    ctx.bind('bar').to(Promise.resolve('BAR'));
  });

  it('resolves constructor arguments', async () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
  });

  // tslint:disable-next-line:max-line-length
  it('resolves constructor arguments with custom async decorator', async () => {
    class TestClass {
      constructor(
        @customAsyncDecorator({x: 'bar'})
        public fooBar: string,
      ) {}
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
      @inject('foo') foo: string;
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
      instantiateClass(TestClass, ctx);
    }).to.throw(/Cannot resolve injected property/);
  });

  it('resolves injected properties with custom resolve function', () => {
    class TestClass {
      @inject('foo', {x: 'bar'}, (c: Context, injection: Injection) => {
        const barKey = injection.metadata && injection.metadata.x;
        const b = c.getSync(barKey);
        const f = c.getSync(injection.bindingKey);
        return f + ':' + b;
      })
      public fooBar: string;
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });

  // tslint:disable-next-line:max-line-length
  it('resolves inject properties with custom resolve function and no binding key', () => {
    class TestClass {
      @inject('', {x: 'bar'}, (c: Context, injection: Injection) => {
        const barKey = injection.metadata && injection.metadata.x;
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
    ctx.bind('foo').to(Promise.resolve('FOO'));
    ctx.bind('bar').to(Promise.resolve('BAR'));
  });

  it('resolves injected properties', async () => {
    class TestClass {
      @inject('foo') foo: string;
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
      @inject('bar') bar: string;

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
    ctx.bind('foo').to(Promise.resolve('FOO'));
    ctx.bind('bar').to(Promise.resolve('BAR'));
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar') bar: string;

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
    ctx.bind('foo').to(Promise.resolve('FOO'));
    ctx.bind('bar').to('BAR');
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar') bar: string;

      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
    expect(t.bar).to.eql('BAR');
  });
});

describe('sync constructor & async property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').to(Promise.resolve('BAR'));
  });

  it('resolves properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar') bar: string;

      constructor(@inject('foo') public foo: string) {}
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
    expect(t.bar).to.eql('BAR');
  });
});

function customDecorator(def: Object) {
  // tslint:disable-next-line:no-any
  return inject('foo', def, (c: Context, injection: Injection) => {
    const barKey = injection.metadata && injection.metadata.x;
    const b = c.getSync(barKey);
    const f = c.getSync(injection.bindingKey);
    return f + ':' + b;
  });
}

function customAsyncDecorator(def: Object) {
  // tslint:disable-next-line:no-any
  return inject('foo', def, async (c: Context, injection: Injection) => {
    const barKey = injection.metadata && injection.metadata.x;
    const b = await c.get(barKey);
    const f = await c.get(injection.bindingKey);
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
    }).to.throw(/The key .+ was not bound to any value/);
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
    ctx.bind('foo').to(Promise.resolve('FOO'));
    ctx.bind('bar').to(Promise.resolve('BAR'));
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
