// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  asGlobalInterceptor,
  Context,
  inject,
  intercept,
  Interceptor,
  InvocationContext,
  invokeMethod,
  invokeMethodWithInterceptors,
  Provider,
  ValueOrPromise,
} from '../..';

describe('Interceptor', () => {
  let ctx: Context;

  beforeEach(givenContextAndEvents);

  it('invokes sync interceptors on a sync method', () => {
    class MyController {
      // Apply `logSync` to a sync instance method
      @intercept(logSync)
      greetSync(name: string) {
        return `Hello, ${name}`;
      }
    }
    const controller = new MyController();

    const msg = invokeMethodWithInterceptors(ctx, controller, 'greetSync', [
      'John',
    ]);
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql([
      'logSync: before-greetSync',
      'logSync: after-greetSync',
    ]);
  });

  it('invokes async interceptors on a sync method', async () => {
    class MyController {
      // Apply `log` to a sync instance method
      @intercept(log)
      greet(name: string) {
        return `Hello, ${name}`;
      }
    }

    const controller = new MyController();
    const msg = await invokeMethodWithInterceptors(ctx, controller, 'greet', [
      'John',
    ]);
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql(['log: before-greet', 'log: after-greet']);
  });

  it('supports interceptor bindings', async () => {
    class MyController {
      // Apply `log` as a binding key to an async instance method
      @intercept('log')
      async greet(name: string) {
        const hello = await Promise.resolve(`Hello, ${name}`);
        return hello;
      }
    }

    const controller = new MyController();
    ctx.bind('log').to(log);
    const msg = await invokeMethodWithInterceptors(ctx, controller, 'greet', [
      'John',
    ]);
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql(['log: before-greet', 'log: after-greet']);
  });

  it('supports interceptor bindings from a provider', async () => {
    class MyController {
      // Apply `name-validator` backed by a provider class
      @intercept('name-validator')
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    const controller = new MyController();
    ctx.bind('valid-names').to(['John', 'Mary']);
    ctx.bind('name-validator').toProvider(NameValidator);
    const msg = await invokeMethodWithInterceptors(ctx, controller, 'greet', [
      'John',
    ]);
    expect(msg).to.equal('Hello, John');
    await expect(
      invokeMethodWithInterceptors(ctx, controller, 'greet', ['Smith']),
    ).to.be.rejectedWith(/Name 'Smith' is not on the list/);
  });

  it('invokes a method with two interceptors', async () => {
    class MyController {
      // Apply `log` and `logSync` to an async instance method
      @intercept('log', logSync)
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    const controller = new MyController();

    ctx.bind('log').to(log);
    const msg = await invokeMethodWithInterceptors(ctx, controller, 'greet', [
      'John',
    ]);
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql([
      'log: before-greet',
      'logSync: before-greet',
      'logSync: after-greet',
      'log: after-greet',
    ]);
  });

  it('invokes a method without interceptors', async () => {
    class MyController {
      // No interceptors
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    const controller = new MyController();

    const msg = await invokeMethodWithInterceptors(ctx, controller, 'greet', [
      'John',
    ]);
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql([]);
  });

  it('allows interceptors to modify args', async () => {
    class MyController {
      // Apply `convertName` to convert `name` arg to upper case
      @intercept(convertName)
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    const controller = new MyController();
    const msg = await invokeMethodWithInterceptors(ctx, controller, 'greet', [
      'John',
    ]);
    expect(msg).to.equal('Hello, JOHN');
    expect(events).to.eql([
      'convertName: before-greet',
      'convertName: after-greet',
    ]);
  });

  it('allows interceptors to catch errors', async () => {
    class MyController {
      // Apply `logError` to catch errors
      @intercept(logError)
      async greet(name: string) {
        throw new Error('error: ' + name);
      }
    }
    const controller = new MyController();
    await expect(
      invokeMethodWithInterceptors(ctx, controller, 'greet', ['John']),
    ).to.be.rejectedWith('error: John');
    expect(events).to.eql(['logError: before-greet', 'logError: error-greet']);
  });

  it('closes invocation context after invocation', async () => {
    const testInterceptor: Interceptor = async (invocationCtx, next) => {
      // Add observers to the invocation context, which in turn adds listeners
      // to its parent - `ctx`
      invocationCtx.subscribe(() => {});
      return next();
    };

    class MyController {
      @intercept(testInterceptor)
      async greet(name: string) {
        return `Hello, ${name}`;
      }
    }

    // No listeners yet
    expect(ctx.listenerCount('bind')).to.eql(0);
    const controller = new MyController();

    // Run the invocation 5 times
    for (let i = 0; i < 5; i++) {
      const count = ctx.listenerCount('bind');
      const invocationPromise = invokeMethodWithInterceptors(
        ctx,
        controller,
        'greet',
        ['John'],
      );
      // New listeners are added to `ctx`
      expect(ctx.listenerCount('bind')).to.be.greaterThan(count);

      // Wait until the invocation finishes
      await invocationPromise;
    }

    // Listeners added by invocation context are gone now
    // There is one left for ctx.observers
    expect(ctx.listenerCount('bind')).to.eql(1);
  });

  it('invokes static interceptors', async () => {
    class MyController {
      // Apply `log` to a static method
      @intercept(log)
      static async greetStatic(name: string) {
        return `Hello, ${name}`;
      }
    }

    const msg = await invokeMethodWithInterceptors(
      ctx,
      MyController,
      'greetStatic',
      ['John'],
    );
    expect(msg).to.equal('Hello, John');
    expect(events).to.eql([
      'log: before-greetStatic',
      'log: after-greetStatic',
    ]);
  });

  it('does not allow @intercept on properties', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyControllerWithProps {
        @intercept(log)
        private status: string;
      }
    }).to.throw(/@intercept cannot be used on a property/);
  });

  context('method dependency injection', () => {
    it('invokes interceptors on a static method', async () => {
      class MyController {
        // Apply `log` to a static method with parameter injection
        @intercept(log)
        static async greetStaticWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      ctx.bind('name').to('John');
      const msg = await invokeMethod(MyController, 'greetStaticWithDI', ctx);
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetStaticWithDI',
        'log: after-greetStaticWithDI',
      ]);
    });

    it('invokes interceptors on an instance method', async () => {
      class MyController {
        // Apply `log` to an async instance method with parameter injection
        @intercept(log)
        async greetWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      const controller = new MyController();

      ctx.bind('name').to('John');
      const msg = await invokeMethod(controller, 'greetWithDI', ctx);
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetWithDI',
        'log: after-greetWithDI',
      ]);
    });
  });

  context('method dependency injection without interceptors', () => {
    it('does not invoke interceptors on a static method', async () => {
      class MyController {
        // Apply `log` to a static method with parameter injection
        @intercept(log)
        static async greetStaticWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      ctx.bind('name').to('John');
      const msg = await invokeMethod(
        MyController,
        'greetStaticWithDI',
        ctx,
        [],
        {skipInterceptors: true},
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([]);
    });

    it('does not invoke interceptors on an instance method', async () => {
      class MyController {
        // Apply `log` to an async instance method with parameter injection
        @intercept(log)
        async greetWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      const controller = new MyController();

      ctx.bind('name').to('John');
      const msg = await invokeMethod(controller, 'greetWithDI', ctx, [], {
        skipInterceptors: true,
      });
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([]);
    });
  });

  context('method interception without injection', () => {
    it('invokes interceptors on a static method', async () => {
      class MyController {
        // Apply `log` to a static method with parameter injection
        @intercept(log)
        static async greetStaticWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      ctx.bind('name').to('John');
      const msg = await invokeMethod(
        MyController,
        'greetStaticWithDI',
        ctx,
        ['John'],
        {skipParameterInjection: true},
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetStaticWithDI',
        'log: after-greetStaticWithDI',
      ]);
    });

    it('invokes interceptors on an instance method', async () => {
      class MyController {
        // Apply `log` to an async instance method with parameter injection
        @intercept(log)
        async greetWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      const controller = new MyController();

      ctx.bind('name').to('John');
      const msg = await invokeMethod(controller, 'greetWithDI', ctx, ['John'], {
        skipParameterInjection: true,
      });
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetWithDI',
        'log: after-greetWithDI',
      ]);
    });
  });

  context('invocation options for invokeMethodWithInterceptors', () => {
    it('can skip parameter injection', async () => {
      const controller = givenController();

      ctx.bind('name').to('Jane');
      const msg = await invokeMethodWithInterceptors(
        ctx,
        controller,
        'greetWithDI',
        // 'John' is passed in as an arg
        ['John'],
        {
          skipParameterInjection: true,
        },
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetWithDI',
        'log: after-greetWithDI',
      ]);
    });

    it('can support parameter injection', async () => {
      const controller = givenController();
      ctx.bind('name').to('Jane');
      const msg = await invokeMethodWithInterceptors(
        ctx,
        controller,
        'greetWithDI',
        // No name is passed in here as it will be provided by the injection
        [],
        {
          skipParameterInjection: false,
        },
      );
      // `Jane` is bound to `name` in the current context
      expect(msg).to.equal('Hello, Jane');
      expect(events).to.eql([
        'log: before-greetWithDI',
        'log: after-greetWithDI',
      ]);
    });

    it('does not allow skipInterceptors', async () => {
      const controller = givenController();
      expect(() => {
        invokeMethodWithInterceptors(ctx, controller, 'greetWithDI', ['John'], {
          skipInterceptors: true,
        });
      }).to.throw(/skipInterceptors is not allowed/);
    });

    function givenController() {
      class MyController {
        // Apply `log` to an async instance method with parameter injection
        @intercept(log)
        async greetWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      return new MyController();
    }
  });

  context('controller method with both interception and injection', () => {
    it('allows interceptor to influence parameter injection', async () => {
      const result = await invokeMethodWithInterceptors(
        ctx,
        new MyController(),
        'interceptedHello',
        [],
        {skipParameterInjection: false},
      );
      // `Mary` is bound to `name` by the interceptor
      expect(result).to.eql('Hello, Mary');
    });

    class MyController {
      @intercept(async (invocationCtx, next) => {
        invocationCtx.bind('name').to('Mary');
        return next();
      })
      async interceptedHello(@inject('name') name: string) {
        return `Hello, ${name}`;
      }
    }
  });

  context('class level interceptors', () => {
    it('invokes sync and async interceptors', async () => {
      // Apply `log` to all methods on the class
      @intercept(log)
      class MyController {
        // We can apply `@intercept` multiple times on the same method
        // This is needed if a custom decorator is created for `@intercept`
        @intercept(log)
        @intercept(logSync)
        greetSync(name: string) {
          return `Hello, ${name}`;
        }
      }

      const msg = await invokeMethodWithInterceptors(
        ctx,
        new MyController(),
        'greetSync',
        ['John'],
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetSync',
        'logSync: before-greetSync',
        'logSync: after-greetSync',
        'log: after-greetSync',
      ]);
    });

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
      const msg = await invokeMethodWithInterceptors(
        ctx,
        new MyController(),
        'greet',
        ['John'],
      );
      expect(msg).to.equal('Hello, JOHN');
      expect(events).to.eql([
        'convertName: before-greet',
        'log: before-greet',
        'log: after-greet',
        'convertName: after-greet',
      ]);
    });

    it('invokes interceptors on a static method', async () => {
      // Apply `log` to all methods on the class
      @intercept(log)
      class MyController {
        // The class level `log` will be applied
        static async greetStatic(name: string) {
          return `Hello, ${name}`;
        }
      }
      const msg = await invokeMethodWithInterceptors(
        ctx,
        MyController,
        'greetStatic',
        ['John'],
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetStatic',
        'log: after-greetStatic',
      ]);
    });

    it('invokes interceptors on a static method with DI', async () => {
      // Apply `log` to all methods on the class
      @intercept(log)
      class MyController {
        @intercept(log)
        static async greetStaticWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      ctx.bind('name').to('John');
      const msg = await invokeMethod(MyController, 'greetStaticWithDI', ctx);
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'log: before-greetStaticWithDI',
        'log: after-greetStaticWithDI',
      ]);
    });
  });

  context('global interceptors', () => {
    beforeEach(givenGlobalInterceptor);

    it('invokes sync and async interceptors', async () => {
      // Apply `log` to all methods on the class
      @intercept(log)
      class MyController {
        // We can apply `@intercept` multiple times on the same method
        // This is needed if a custom decorator is created for `@intercept`
        @intercept(log)
        @intercept(logSync)
        greetSync(name: string) {
          return `Hello, ${name}`;
        }
      }
      const msg = await invokeMethodWithInterceptors(
        ctx,
        new MyController(),
        'greetSync',
        ['John'],
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'globalLog: before-greetSync',
        'log: before-greetSync',
        'logSync: before-greetSync',
        'logSync: after-greetSync',
        'log: after-greetSync',
        'globalLog: after-greetSync',
      ]);
    });

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
      const msg = await invokeMethodWithInterceptors(
        ctx,
        new MyController(),
        'greet',
        ['John'],
      );
      expect(msg).to.equal('Hello, JOHN');
      expect(events).to.eql([
        'globalLog: before-greet',
        'convertName: before-greet',
        'log: before-greet',
        'log: after-greet',
        'convertName: after-greet',
        'globalLog: after-greet',
      ]);
    });

    it('invokes interceptors on a static method', async () => {
      // Apply `log` to all methods on the class
      @intercept(log)
      class MyController {
        // The class level `log` will be applied
        static async greetStatic(name: string) {
          return `Hello, ${name}`;
        }
      }
      const msg = await invokeMethodWithInterceptors(
        ctx,
        MyController,
        'greetStatic',
        ['John'],
      );
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'globalLog: before-greetStatic',
        'log: before-greetStatic',
        'log: after-greetStatic',
        'globalLog: after-greetStatic',
      ]);
    });

    it('invokes interceptors on a static method with DI', async () => {
      // Apply `log` to all methods on the class
      @intercept(log)
      class MyController {
        @intercept(log)
        static async greetStaticWithDI(@inject('name') name: string) {
          return `Hello, ${name}`;
        }
      }
      ctx.bind('name').to('John');
      const msg = await invokeMethod(MyController, 'greetStaticWithDI', ctx);
      expect(msg).to.equal('Hello, John');
      expect(events).to.eql([
        'globalLog: before-greetStaticWithDI',
        'log: before-greetStaticWithDI',
        'log: after-greetStaticWithDI',
        'globalLog: after-greetStaticWithDI',
      ]);
    });

    function givenGlobalInterceptor() {
      const globalLog: Interceptor = async (invocationCtx, next) => {
        events.push('globalLog: before-' + invocationCtx.methodName);
        const result = await next();
        events.push('globalLog: after-' + invocationCtx.methodName);
        return result;
      };
      ctx
        .bind('globalLog')
        .to(globalLog)
        .apply(asGlobalInterceptor());
    }
  });

  let events: string[];

  const logSync: Interceptor = (invocationCtx, next) => {
    events.push('logSync: before-' + invocationCtx.methodName);
    // Calling `next()` without `await`
    const result = next();
    // It's possible that the statement below is executed before downstream
    // interceptors or the target method finish
    events.push('logSync: after-' + invocationCtx.methodName);
    return result;
  };

  const log: Interceptor = async (invocationCtx, next) => {
    events.push('log: before-' + invocationCtx.methodName);
    const result = await next();
    events.push('log: after-' + invocationCtx.methodName);
    return result;
  };

  const logError: Interceptor = async (invocationCtx, next) => {
    events.push('logError: before-' + invocationCtx.methodName);
    try {
      const result = await next();
      events.push('logError: after-' + invocationCtx.methodName);
      return result;
    } catch (err) {
      events.push('logError: error-' + invocationCtx.methodName);
      throw err;
    }
  };

  // An interceptor to convert the 1st arg to upper case
  const convertName: Interceptor = async (invocationCtx, next) => {
    events.push('convertName: before-' + invocationCtx.methodName);
    invocationCtx.args[0] = (invocationCtx.args[0] as string).toUpperCase();
    const result = await next();
    events.push('convertName: after-' + invocationCtx.methodName);
    return result;
  };

  /**
   * A binding provider class to produce an interceptor that validates the
   * `name` argument
   */
  class NameValidator implements Provider<Interceptor> {
    constructor(@inject('valid-names') private validNames: string[]) {}

    value() {
      return this.intercept.bind(this);
    }

    async intercept<T>(
      invocationCtx: InvocationContext,
      next: () => ValueOrPromise<T>,
    ) {
      const name = invocationCtx.args[0];
      if (!this.validNames.includes(name)) {
        throw new Error(
          `Name '${name}' is not on the list of '${this.validNames}`,
        );
      }
      return next();
    }
  }

  function givenContextAndEvents() {
    ctx = new Context();
    events = [];
  }
});
