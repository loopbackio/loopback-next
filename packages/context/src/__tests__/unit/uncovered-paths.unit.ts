// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Binding,
  BindingKey,
  BindingScope,
  config,
  Constructor,
  Context,
  ContextView,
  createProxyWithInterceptors,
  Getter,
  InvocationContext,
  intercept,
  registerInterceptor,
  GenericInterceptorChain,
  hasInjections,
  inject,
  injectable,
  inspectInjections,
  instantiateClass,
  invokeMethod,
  isBindingAddress,
  Interceptor,
  Provider,
  uuid,
} from '../..';

/**
 * Additional unit tests for rarely exercised code paths that are not covered
 * by the feature-focused test suites.
 */
describe('context: additional coverage', () => {
  describe('@injectable.provider', () => {
    it('throws if the target is not a Provider class', () => {
      class NotAProvider {}
      expect(() =>
        injectable.provider()(NotAProvider as unknown as Constructor<unknown>),
      ).to.throw(/is not a Provider/);
    });
  });

  describe('BindingKey', () => {
    it('validate() rejects an empty key', () => {
      expect(() => BindingKey.validate('')).to.throw(
        'Binding key must be provided.',
      );
    });
  });

  describe('isBindingAddress', () => {
    it('returns false for null selectors', () => {
      expect(isBindingAddress(null as unknown as string)).to.be.false();
    });

    it('returns false for non-object, non-string selectors', () => {
      expect(isBindingAddress((() => true) as unknown as string)).to.be.false();
    });
  });

  describe('Binding', () => {
    it('refresh() is a no-op if nothing has been cached', () => {
      const ctx = new Context();
      const binding = ctx.bind('foo').to('bar');
      expect(() => binding.refresh(ctx)).to.not.throw();
    });

    it('rejects when no value is configured for the binding', async () => {
      const ctx = new Context();
      ctx.add(new Binding('no-value'));
      await expect(ctx.get('no-value')).to.be.rejectedWith(
        /No value was configured for binding no-value/,
      );
    });

    it('returns undefined for an unconfigured optional binding', async () => {
      const ctx = new Context();
      ctx.add(new Binding('no-value'));
      expect(await ctx.get('no-value', {optional: true})).to.be.undefined();
    });

    it('returns undefined for a server-scoped binding outside a server context if optional', async () => {
      const ctx = new Context('app');
      ctx.bind('state').to('value').inScope(BindingScope.SERVER);
      expect(await ctx.get('state', {optional: true})).to.be.undefined();
    });

    it('throws for a server-scoped binding outside a server context', async () => {
      const ctx = new Context('app');
      ctx.bind('state').to('value').inScope(BindingScope.SERVER);
      await expect(ctx.get('state')).to.be.rejectedWith(
        /Binding "state" in context "app" cannot be resolved in scope "Server"/,
      );
    });

    it('delegates once() to the event emitter', () => {
      const binding = new Binding('foo');
      let called = 0;
      binding.once('changed', () => called++);
      binding.emit('changed');
      binding.emit('changed');
      expect(called).to.equal(1);
    });
  });

  describe('ContextView', () => {
    it('delegates once() to the event emitter', () => {
      const ctx = new Context();
      const view = new ContextView(ctx, () => true);
      let called = 0;
      view.once('refresh', () => called++);
      view.emit('refresh');
      view.emit('refresh');
      expect(called).to.equal(1);
    });

    it('singleValue() returns undefined when there are no matches', async () => {
      const ctx = new Context();
      const view = ctx.createView(b => b.key.startsWith('nothing'));
      expect(await view.singleValue()).to.be.undefined();
    });

    it('singleValue() returns the only matching value', async () => {
      const ctx = new Context();
      ctx.bind('one.a').to('A').tag('one');
      const view = ctx.createView(b => b.tagMap['one'] != null);
      expect(await view.singleValue()).to.equal('A');
    });

    it('singleValue() fails when there is more than one match', async () => {
      const ctx = new Context();
      ctx.bind('many.a').to('A').tag('many');
      ctx.bind('many.b').to('B').tag('many');
      const view = ctx.createView(b => b.tagMap['many'] != null);
      await expect(view.singleValue()).to.be.rejectedWith(
        /more than one value/,
      );
    });

    it('open() returns the existing subscription if already open', () => {
      const ctx = new Context();
      const view = ctx.createView(() => true);
      const first = view.open();
      const second = view.open();
      expect(second).to.equal(first);
      view.close();
    });
  });

  describe('Context.findByTag()', () => {
    it('returns no bindings if one of the tag names is unknown', () => {
      const ctx = new Context();
      ctx.bind('a').to('A').tag({known: 'yes'});
      expect(ctx.findByTag({known: 'yes', unknown: 'no'})).to.be.empty();
    });

    it('intersects bindings that match multiple tag names', () => {
      const ctx = new Context();
      ctx.bind('a').to('A').tag({x: '1', y: '1'});
      ctx.bind('b').to('B').tag({x: '1'});
      ctx.bind('c').to('C').tag({y: '1'});
      const keys = ctx.findByTag({x: '1', y: '1'}).map(b => b.key);
      expect(keys).to.eql(['a']);
    });

    it('stops early when the tag intersection is empty', () => {
      const ctx = new Context();
      ctx.bind('a').to('A').tag({x: '1'});
      ctx.bind('b').to('B').tag({y: '1'});
      ctx.bind('c').to('C').tag({z: '1'});
      expect(ctx.findByTag({x: '1', y: '1', z: '1'})).to.be.empty();
    });
  });

  describe('hasInjections', () => {
    it('detects classes with constructor injections', () => {
      class WithCtor {
        constructor(@inject('a') public a: string) {}
      }
      expect(hasInjections(WithCtor)).to.be.true();
    });

    it('detects classes with property injections', () => {
      class WithProp {
        @inject('a')
        a: string;
      }
      expect(hasInjections(WithProp)).to.be.true();
    });

    it('detects classes with method injections', () => {
      class WithMethod {
        run(@inject('a') a: string) {
          return a;
        }
      }
      expect(hasInjections(WithMethod)).to.be.true();
    });

    it('returns false for classes without injections', () => {
      class Plain {}
      expect(hasInjections(Plain)).to.be.false();
    });
  });

  describe('@inject.setter and @inject.binding', () => {
    it('@inject.setter rejects a binding filter', async () => {
      class Controller {
        constructor(
          @inject.setter((() => true) as unknown as string)
          public setter: Function,
        ) {}
      }
      const ctx = new Context();
      ctx.bind('controller').toClass(Controller);
      await expect(ctx.get('controller')).to.be.rejectedWith(
        /does not allow BindingFilter/,
      );
    });

    it('@inject.binding rejects a binding filter', async () => {
      class Controller {
        constructor(
          @inject.binding((() => true) as unknown as string)
          public binding: Binding,
        ) {}
      }
      const ctx = new Context();
      ctx.bind('controller').toClass(Controller);
      await expect(ctx.get('controller')).to.be.rejectedWith(
        /does not allow BindingFilter/,
      );
    });
  });

  describe('GenericInterceptorChain', () => {
    it('invokes interceptors in order and then the final handler', async () => {
      const events: string[] = [];
      const chain = new GenericInterceptorChain(new Context(), [
        async (_ctx, next) => {
          events.push('i1');
          return next();
        },
        async (_ctx, next) => {
          events.push('i2');
          return next();
        },
      ]);
      const result = await chain.invokeInterceptors(() => {
        events.push('final');
        return 'done';
      });
      expect(result).to.equal('done');
      expect(events).to.eql(['i1', 'i2', 'final']);
    });
  });

  describe('invokeMethod() with skipInterceptors', () => {
    class Greeter {
      greet(@inject('name') name: string) {
        return `Hello, ${name}`;
      }
      plain(name: string) {
        return `Hi, ${name}`;
      }
    }

    it('invokes the method with injection', async () => {
      const ctx = new Context();
      ctx.bind('name').to('Alice');
      const result = await invokeMethod(new Greeter(), 'greet', ctx, [], {
        skipInterceptors: true,
      });
      expect(result).to.equal('Hello, Alice');
    });

    it('invokes the method directly without injection', async () => {
      const ctx = new Context();
      const result = await invokeMethod(new Greeter(), 'plain', ctx, ['Bob'], {
        skipInterceptors: true,
        skipParameterInjection: true,
      });
      expect(result).to.equal('Hi, Bob');
    });
  });

  describe('Provider-based resolution', () => {
    it('resolves a provider class bound with toProvider()', async () => {
      class GreetingProvider implements Provider<string> {
        value() {
          return 'hello';
        }
      }
      const ctx = new Context();
      ctx.bind('greeting').toProvider(GreetingProvider);
      expect(await ctx.get('greeting')).to.equal('hello');
    });
  });

  describe('InvocationContext', () => {
    it('describes the invocation with toString()', () => {
      class Greeter {
        greet(name: string) {
          return name;
        }
      }
      const invocationCtx = new InvocationContext(
        new Context(),
        new Greeter(),
        'greet',
        ['x'],
      );
      expect(invocationCtx.toString()).to.equal(invocationCtx.description);
      expect(invocationCtx.toString()).to.match(
        /^InvocationContext\(.+\): Greeter\.prototype\.greet$/,
      );
    });
  });

  describe('interceptors', () => {
    it('merges @intercept applied multiple times on a class', async () => {
      const events: string[] = [];
      @intercept(async (_ctx, next) => {
        events.push('first');
        return next();
      })
      @intercept(async (_ctx, next) => {
        events.push('second');
        return next();
      })
      class Greeter {
        greet(name: string) {
          return `Hello, ${name}`;
        }
      }
      const proxy = createProxyWithInterceptors(new Greeter(), new Context());
      expect(await proxy.greet('Bob')).to.equal('Hello, Bob');
      expect(events).to.eql(['first', 'second']);
    });

    it('merges @intercept applied multiple times on a method', async () => {
      const events: string[] = [];
      class Greeter {
        @intercept(async (_ctx, next) => {
          events.push('first');
          return next();
        })
        @intercept(async (_ctx, next) => {
          events.push('second');
          return next();
        })
        greet(name: string) {
          return `Hello, ${name}`;
        }
      }
      const proxy = createProxyWithInterceptors(new Greeter(), new Context());
      expect(await proxy.greet('Bob')).to.equal('Hello, Bob');
      expect(events).to.eql(['first', 'second']);
    });

    it('registers a global interceptor when group is set', () => {
      const ctx = new Context();
      const binding = registerInterceptor(ctx, async (_c, next) => next(), {
        group: 'g1',
      });
      expect(binding.tagMap).to.containEql({
        globalInterceptor: 'globalInterceptor',
        globalInterceptorGroup: 'g1',
      });
    });

    it('registers a provider class as an interceptor', () => {
      class MyInterceptorProvider implements Provider<Interceptor> {
        value(): Interceptor {
          return (_ctx, next) => next();
        }
      }
      const ctx = new Context();
      const binding = registerInterceptor(ctx, MyInterceptorProvider);
      expect(binding.key).to.match(/^interceptors\./);
      expect(ctx.contains(binding.key)).to.be.true();
    });
  });

  describe('interception proxy', () => {
    class Plain {
      name = 'plain';
      echo(value: string) {
        return value;
      }
    }

    it('returns non-function properties as is', () => {
      const proxy = createProxyWithInterceptors(new Plain(), new Context());
      expect(proxy.name).to.equal('plain');
    });

    it('returns symbol-keyed properties as is', () => {
      const sym = Symbol('s');
      const target = Object.assign(new Plain(), {[sym]: 'sym-value'});
      const proxy = createProxyWithInterceptors(target, new Context());
      expect((proxy as unknown as Record<symbol, string>)[sym]).to.equal(
        'sym-value',
      );
    });
  });

  describe('@config.getter and @config.view', () => {
    it('@config.getter resolves the configuration lazily', async () => {
      class Server {
        constructor(
          @config.getter()
          public getConfig: Getter<{port: number}>,
        ) {}
      }
      const ctx = new Context();
      ctx.configure('server').to({port: 3000});
      ctx.bind('server').toClass(Server);
      const server = await ctx.get<Server>('server');
      expect(await server.getConfig()).to.eql({port: 3000});
    });

    it('@config.getter resolves to undefined without a current binding', async () => {
      class Server {
        constructor(
          @config.getter()
          public getConfig: Getter<unknown>,
        ) {}
      }
      const ctx = new Context();
      const server = await instantiateClass(Server, ctx);
      expect(await server.getConfig()).to.be.undefined();
    });

    it('@config.view resolves to undefined without a current binding', async () => {
      class Server {
        constructor(
          @config.view()
          public view: ContextView<unknown>,
        ) {}
      }
      const ctx = new Context();
      const server = await instantiateClass(Server, ctx);
      expect(server.view).to.be.undefined();
    });
  });

  describe('context observers', () => {
    it('unsubscribe() returns false if there are no observers', () => {
      const ctx = new Context();
      expect(ctx.unsubscribe({observe() {}})).to.be.false();
    });

    it('isSubscribed() returns false if there are no observers', () => {
      const ctx = new Context();
      expect(ctx.isSubscribed({observe() {}})).to.be.false();
    });

    it('notifies function observers of bind events', async () => {
      const ctx = new Context();
      const events: string[] = [];
      ctx.subscribe((type, binding) => {
        events.push(`${type}:${binding.key}`);
      });
      ctx.bind('foo').to('bar');
      await new Promise(resolve => setImmediate(resolve));
      expect(events).to.eql(['bind:foo']);
    });

    it('close() stops notifications and is safe to call repeatedly', async () => {
      const parent = new Context('parent');
      const child = new Context(parent, 'child');
      const events: string[] = [];
      child.subscribe((type, binding) => {
        events.push(binding.key);
      });
      child.close();
      parent.bind('after-close').to('x');
      await new Promise(resolve => setImmediate(resolve));
      expect(events).to.be.empty();
      expect(() => child.close()).to.not.throw();
    });
  });

  describe('inspectInjections', () => {
    it('describes injections that use binding filters', () => {
      class Consumer {
        constructor(
          @inject(
            function matchX(b) {
              return b.key.startsWith('x');
            },
            {optional: true},
          )
          public values: unknown[],
        ) {}
      }
      const binding = new Context().bind('consumer').toClass(Consumer);
      expect(inspectInjections(binding)).to.eql({
        constructorArguments: [
          {
            targetName: 'Consumer.constructor[0]',
            bindingFilter: 'matchX',
            optional: true,
          },
        ],
      });
    });

    it('returns an empty object for bindings without a class', () => {
      const binding = new Context().bind('value').to('x');
      expect(inspectInjections(binding)).to.eql({});
    });
  });

  describe('uuid()', () => {
    it('generates a v4 uuid', () => {
      expect(uuid()).to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });
  });
});
