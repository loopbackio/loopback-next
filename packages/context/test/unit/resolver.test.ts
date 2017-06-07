// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, instantiateClass, resolveValueOrPromise} from '../..';

describe('constructor injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
  });

  it('can resolve constructor arguments', () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {
      }
    }

    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.foo).to.eql('FOO');
  });
});

describe('async constructor injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
  });

  it('can resolve constructor arguments', async () => {
    class TestClass {
      constructor(@inject('foo') public foo: string) {
      }
    }

    const t = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
  });
});

describe('property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to('FOO');
  });

  it('can resolve injected properties', () => {
    class TestClass {
      @inject('foo') foo: string;
    }
    const t = instantiateClass(TestClass, ctx) as TestClass;
    expect(t.foo).to.eql('FOO');
  });
});

describe('async property injection', () => {
  let ctx: Context;

  before(function() {
    ctx = new Context();
    ctx.bind('foo').to(Promise.resolve('FOO'));
  });

  it('can resolve injected properties', async () => {
    class TestClass {
      @inject('foo') foo: string;
    }
    const t: TestClass = await instantiateClass(TestClass, ctx);
    expect(t.foo).to.eql('FOO');
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

describe('resolveValueOrPromise()', () => {
  it('resolves both a promise and a value', async () => {
    const value: String = 'hello';
    const promise = new Promise<String>((resolve) => {
      resolve(value);
    });
    const result1 = await resolveValueOrPromise<String>(promise);
    const result2 = await resolveValueOrPromise<String>(value);
    expect(result1).to.be.equal(result2);
  });
});
