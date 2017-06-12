// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, instantiateClass, Injection} from '../..';

describe('constructor injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
    ctx.bind('bar').to('BAR');
  });

  it('can resolve constructor arguments', () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {
      }
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.foo).to.eql('FOO');
  });

  it('can report error for missing binding key', () => {
    class TestClass {
      constructor(@inject('', {x: 'bar'}) public fooBar: string) {
      }
    }

    expect(() => {
      const t = instantiateClass(TestClass, ctx) as TestClass;
    }).to.throw(/Cannot resolve injected arguments/);
  });

  it('can resolve constructor arguments with custom resolve function', () => {
    class TestClass {
      constructor(@inject('foo', {x: 'bar'},  (c: Context, injection: Injection) => {
        const barKey = injection.metadata && injection.metadata.x;
        const b = c.getSync(barKey);
        const f = c.getSync(injection.bindingKey);
        return f + ':' + b;
      }) public fooBar: string) {
      }
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('FOO:BAR');
  });

  it('can resolve constructor arguments with custom resolve function and no binding key', () => {
    class TestClass {
      constructor(@inject('', {x: 'bar'},  (c: Context, injection: Injection) => {
        const barKey = injection.metadata && injection.metadata.x;
        const b = c.getSync(barKey);
        return 'foo' + ':' + b;
      }) public fooBar: string) {
      }
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('foo:BAR');
  });

  it('can resolve constructor arguments with custom decorator', () => {
    class TestClass {
      constructor(@customDecorator({x: 'bar'}) public fooBar: string) {
      }
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

  it('can resolve constructor arguments', async () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {
      }
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
  });

  it('can resolve constructor arguments with custom async decorator', async () => {
    class TestClass {
      constructor(@customAsyncDecorator({x: 'bar'}) public fooBar: string) {
      }
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

  it('can resolve injected properties', () => {
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
      const t = instantiateClass(TestClass, ctx) as TestClass;
    }).to.throw(/Cannot resolve injected property/);
  });

  it('can resolve injected properties with custom resolve function', () => {
    class TestClass {
      @inject('foo', {x: 'bar'},  (c: Context, injection: Injection) => {
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

  it('can resolve inject properties with custom resolve function and no binding key', () => {
    class TestClass {
      @inject('', {x: 'bar'},  (c: Context, injection: Injection) => {
        const barKey = injection.metadata && injection.metadata.x;
        const b = c.getSync(barKey);
        return 'foo' + ':' + b;
      })
      public fooBar: string;
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.fooBar).to.eql('foo:BAR');
  });

  it('can resolve injected properties with custom decorator', () => {
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

  it('can resolve injected properties', async () => {
    class TestClass {
      @inject('foo') foo: string;
    }
    const t: TestClass = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
  });

  it('can resolve properties with custom async decorator', async () => {
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

  it('can resolve properties and constructor arguments', () => {
    class TestClass {
      @inject('bar') bar: string;

      constructor(@inject('foo') public foo: string) {
      }
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

  it('can resolve properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar') bar: string;

      constructor(@inject('foo') public foo: string) {
      }
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

  it('can resolve properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar') bar: string;

      constructor(@inject('foo') public foo: string) {
      }
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

  it('can resolve properties and constructor arguments', async () => {
    class TestClass {
      @inject('bar') bar: string;

      constructor(@inject('foo') public foo: string) {
      }
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
