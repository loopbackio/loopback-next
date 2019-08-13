// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  AsyncProxy,
  Context,
  createProxyWithInterceptors,
  inject,
  intercept,
  Interceptor,
  ValueOrPromise,
} from '../..';

describe('Interception proxy', () => {
  let ctx: Context;

  beforeEach(givenContextAndEvents);

  it('invokes async interceptors on an async method', async () => {
    // Apply `log` to all methods on the class
    @intercept(log)
    class MyController {
      // Apply multiple interceptors. The order of `log` will be preserved as it
      // explicitly listed at method level
      @intercept(convertName, log)
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    const proxy = createProxyWithInterceptors(new MyController(), ctx);
    const msg = await proxy.greet('John');
    expect(msg).to.equal('Hello, JOHN');
    expect(events).to.eql([
      'convertName: before-greet',
      'log: before-greet',
      'log: after-greet',
      'convertName: after-greet',
    ]);
  });

  it('creates a proxy that converts sync method to be async', async () => {
    // Apply `log` to all methods on the class
    @intercept(log)
    class MyController {
      // Apply multiple interceptors. The order of `log` will be preserved as it
      // explicitly listed at method level
      @intercept(convertName, log)
      greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    const proxy = createProxyWithInterceptors(new MyController(), ctx);
    const msg = await proxy.greet('John');
    expect(msg).to.equal('Hello, JOHN');
    expect(events).to.eql([
      'convertName: before-greet',
      'log: before-greet',
      'log: after-greet',
      'convertName: after-greet',
    ]);

    // Make sure `greet` always return Promise now
    expect(proxy.greet('Jane')).to.be.instanceOf(Promise);
  });

  it('creates async methods for the proxy', () => {
    class MyController {
      name: string;

      greet(name: string): string {
        return `Hello, ${name}`;
      }

      async hello(name: string) {
        return `Hello, ${name}`;
      }
    }

    interface ExpectedAsyncProxyForMyController {
      name: string;
      greet(name: string): ValueOrPromise<string>; // the return type becomes `Promise<string>`
      hello(name: string): Promise<string>; // the same as MyController
    }

    const proxy = createProxyWithInterceptors(new MyController(), ctx);

    // Enforce compile time check to ensure the AsyncProxy typing works for TS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const check: ExpectedAsyncProxyForMyController = proxy;
  });

  it('invokes interceptors on a static method', async () => {
    // Apply `log` to all methods on the class
    @intercept(log)
    class MyController {
      // The class level `log` will be applied
      static greetStatic(name: string) {
        return `Hello, ${name}`;
      }
    }
    ctx.bind('name').to('John');
    const proxy = createProxyWithInterceptors(MyController, ctx);
    const msg = await proxy.greetStatic('John');
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql([
      'log: before-greetStatic',
      'log: after-greetStatic',
    ]);
  });

  it('accesses properties on the proxy', () => {
    class MyController {
      constructor(public prefix: string) {}

      greet() {
        return `${this.prefix}: Hello`;
      }
    }

    const proxy = createProxyWithInterceptors(new MyController('abc'), ctx);
    expect(proxy.prefix).to.eql('abc');
    proxy.prefix = 'xyz';
    expect(proxy.prefix).to.eql('xyz');
  });

  it('accesses static properties on the proxy', () => {
    class MyController {
      static count = 0;
    }

    const proxyForClass = createProxyWithInterceptors(MyController, ctx);
    expect(proxyForClass.count).to.eql(0);
    proxyForClass.count = 3;
    expect(proxyForClass.count).to.eql(3);
  });

  it('supports asProxyWithInterceptors resolution option', async () => {
    // Apply `log` to all methods on the class
    @intercept(log)
    class MyController {
      // Apply multiple interceptors. The order of `log` will be preserved as it
      // explicitly listed at method level
      @intercept(convertName, log)
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    ctx.bind('my-controller').toClass(MyController);
    const proxy = await ctx.get<MyController>('my-controller', {
      asProxyWithInterceptors: true,
    });
    const msg = await proxy!.greet('John');
    expect(msg).to.equal('Hello, JOHN');
    expect(events).to.eql([
      'convertName: before-greet',
      'log: before-greet',
      'log: after-greet',
      'convertName: after-greet',
    ]);
  });

  it('reports error when asProxyWithInterceptors is set for non-Class binding', async () => {
    ctx.bind('my-value').toDynamicValue(() => 'my-value');
    await expect(
      ctx.get<string>('my-value', {
        asProxyWithInterceptors: true,
      }),
    ).to.be.rejectedWith(
      `Binding 'my-value' (DynamicValue) does not support 'asProxyWithInterceptors'`,
    );
  });

  it('supports asProxyWithInterceptors resolution option for @inject', async () => {
    // Apply `log` to all methods on the class
    @intercept(log)
    class MyController {
      // Apply multiple interceptors. The order of `log` will be preserved as it
      // explicitly listed at method level
      @intercept(convertName, log)
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }

    class DummyController {
      constructor(
        @inject('my-controller', {asProxyWithInterceptors: true})
        public readonly myController: AsyncProxy<MyController>,
      ) {}
    }
    ctx.bind('my-controller').toClass(MyController);
    ctx.bind('dummy-controller').toClass(DummyController);
    const dummyController = await ctx.get<DummyController>('dummy-controller');
    const msg = await dummyController.myController.greet('John');
    expect(msg).to.equal('Hello, JOHN');
    expect(events).to.eql([
      'convertName: before-greet',
      'log: before-greet',
      'log: after-greet',
      'convertName: after-greet',
    ]);
  });

  let events: string[];

  const log: Interceptor = async (invocationCtx, next) => {
    events.push('log: before-' + invocationCtx.methodName);
    const result = await next();
    events.push('log: after-' + invocationCtx.methodName);
    return result;
  };

  // An interceptor to convert the 1st arg to upper case
  const convertName: Interceptor = async (invocationCtx, next) => {
    events.push('convertName: before-' + invocationCtx.methodName);
    invocationCtx.args[0] = (invocationCtx.args[0] as string).toUpperCase();
    const result = await next();
    events.push('convertName: after-' + invocationCtx.methodName);
    return result;
  };

  function givenContextAndEvents() {
    ctx = new Context();
    events = [];
  }
});
