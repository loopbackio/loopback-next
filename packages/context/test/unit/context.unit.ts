// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Context,
  Binding,
  BindingScope,
  BindingType,
  isPromiseLike,
  BindingKey,
  BoundValue,
} from '../..';

/**
 * Create a subclass of context so that we can access parents and registry
 * for assertions
 */
class TestContext extends Context {
  get parent() {
    return this._parent;
  }
  get bindingMap() {
    const map = new Map(this.registry);
    return map;
  }
}

describe('Context constructor', () => {
  it('generates uuid name if not provided', () => {
    const ctx = new Context();
    expect(ctx.name).to.match(
      /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    );
  });

  it('generates unique names for different instances', () => {
    const ctx1 = new Context();
    const ctx2 = new Context();
    expect(ctx1.name).to.not.eql(ctx2.name);
  });

  it('accepts a name', () => {
    const ctx = new Context('my-context');
    expect(ctx.name).to.eql('my-context');
  });

  it('accepts a parent context', () => {
    const c1 = new Context('c1');
    const ctx = new TestContext(c1);
    expect(ctx.parent).to.eql(c1);
  });

  it('accepts a parent context and a name', () => {
    const c1 = new Context('c1');
    const ctx = new TestContext(c1, 'c2');
    expect(ctx.name).to.eql('c2');
    expect(ctx.parent).to.eql(c1);
  });
});

describe('Context', () => {
  let ctx: Context;
  beforeEach('given a context', createContext);

  describe('bind', () => {
    it('adds a binding into the registry', () => {
      ctx.bind('foo');
      const result = ctx.contains('foo');
      expect(result).to.be.true();
    });

    it('returns a binding', () => {
      const binding = ctx.bind('foo');
      expect(binding).to.be.instanceOf(Binding);
    });

    it('rejects a key containing property separator', () => {
      const key = 'a' + BindingKey.PROPERTY_SEPARATOR + 'b';
      expect(() => ctx.bind(key)).to.throw(/Binding key .* cannot contain/);
    });

    it('rejects rebinding of a locked key', () => {
      ctx.bind('foo').lock();
      expect(() => ctx.bind('foo')).to.throw(
        'Cannot rebind key "foo" to a locked binding',
      );
    });
  });

  describe('add', () => {
    it('accepts a binding', () => {
      const binding = new Binding('foo').to('bar');
      ctx.add(binding);
      expect(ctx.getBinding(binding.key)).to.be.exactly(binding);
      const result = ctx.contains('foo');
      expect(result).to.be.true();
    });

    it('rejects rebinding of a locked key', () => {
      ctx.bind('foo').lock();
      expect(() => ctx.add(new Binding('foo'))).to.throw(
        'Cannot rebind key "foo" to a locked binding',
      );
    });
  });

  describe('contains', () => {
    it('returns true when the key is the registry', () => {
      ctx.bind('foo');
      const result = ctx.contains('foo');
      expect(result).to.be.true();
    });

    it('returns false when the key is not in the registry', () => {
      const result = ctx.contains('bar');
      expect(result).to.be.false();
    });

    it('returns false when the key is only in the parent context', () => {
      ctx.bind('foo');
      const childCtx = new Context(ctx);
      const result = childCtx.contains('foo');
      expect(result).to.be.false();
    });
  });

  describe('isBound', () => {
    it('returns true when the key is bound in the context', () => {
      ctx.bind('foo');
      const result = ctx.isBound('foo');
      expect(result).to.be.true();
    });

    it('returns false when the key is not bound in the context', () => {
      const result = ctx.isBound('bar');
      expect(result).to.be.false();
    });

    it('returns true when the key is bound in the context hierarchy', () => {
      ctx.bind('foo');
      const childCtx = new Context(ctx);
      const result = childCtx.isBound('foo');
      expect(result).to.be.true();
    });

    it('returns false when the key is not bound in the context hierarchy', () => {
      ctx.bind('foo');
      const childCtx = new Context(ctx);
      const result = childCtx.isBound('bar');
      expect(result).to.be.false();
    });
  });

  describe('unbind', () => {
    it('removes a binding', () => {
      ctx.bind('foo');
      const result = ctx.unbind('foo');
      expect(result).to.be.true();
      expect(ctx.contains('foo')).to.be.false();
    });

    it('returns false if the binding key does not exist', () => {
      ctx.bind('foo');
      const result = ctx.unbind('bar');
      expect(result).to.be.false();
    });

    it('cannot unbind a locked binding', () => {
      ctx
        .bind('foo')
        .to('a')
        .lock();
      expect(() => ctx.unbind('foo')).to.throw(
        `Cannot unbind key "foo" of a locked binding`,
      );
    });

    it('does not remove a binding from parent contexts', () => {
      ctx.bind('foo');
      const childCtx = new Context(ctx);
      const result = childCtx.unbind('foo');
      expect(result).to.be.false();
      expect(ctx.contains('foo')).to.be.true();
    });
  });

  describe('find', () => {
    it('returns matching binding', () => {
      const b1 = ctx.bind('foo');
      ctx.bind('bar');
      const result = ctx.find('foo');
      expect(result).to.be.eql([b1]);
    });

    it('returns matching binding with *', () => {
      const b1 = ctx.bind('foo');
      const b2 = ctx.bind('bar');
      const b3 = ctx.bind('baz');
      let result = ctx.find('*');
      expect(result).to.be.eql([b1, b2, b3]);
      result = ctx.find('ba*');
      expect(result).to.be.eql([b2, b3]);
    });

    it('returns matching binding with * respecting key separators', () => {
      const b1 = ctx.bind('foo');
      const b2 = ctx.bind('foo.bar');
      const b3 = ctx.bind('foo:bar');
      let result = ctx.find('*');
      expect(result).to.be.eql([b1]);
      result = ctx.find('*.*');
      expect(result).to.be.eql([b2]);
      result = ctx.find('*:ba*');
      expect(result).to.be.eql([b3]);
    });

    it('returns matching binding with ? respecting separators', () => {
      const b1 = ctx.bind('foo');
      const b2 = ctx.bind('foo.bar');
      const b3 = ctx.bind('foo:bar');
      let result = ctx.find('???');
      expect(result).to.be.eql([b1]);
      result = ctx.find('???.???');
      expect(result).to.be.eql([b2]);
      result = ctx.find('???:???');
      expect(result).to.be.eql([b3]);
      result = ctx.find('?');
      expect(result).to.be.eql([]);
      result = ctx.find('???????');
      expect(result).to.be.eql([]);
    });

    it('escapes reserved chars for regexp', () => {
      ctx.bind('foo');
      const b2 = ctx.bind('foo+bar');
      const b3 = ctx.bind('foo|baz');
      let result = ctx.find('fo+');
      expect(result).to.be.eql([]);
      result = ctx.find('foo+bar');
      expect(result).to.be.eql([b2]);
      result = ctx.find('foo|baz');
      expect(result).to.be.eql([b3]);
    });

    it('returns matching binding with regexp', () => {
      const b1 = ctx.bind('foo');
      const b2 = ctx.bind('bar');
      const b3 = ctx.bind('baz');
      let result = ctx.find(/\w+/);
      expect(result).to.be.eql([b1, b2, b3]);
      result = ctx.find(/ba/);
      expect(result).to.be.eql([b2, b3]);
    });

    it('returns matching binding with filter', () => {
      const b1 = ctx.bind('foo').inScope(BindingScope.SINGLETON);
      const b2 = ctx.bind('bar').tag('b');
      const b3 = ctx.bind('baz').tag('b');
      let result = ctx.find(() => true);
      expect(result).to.be.eql([b1, b2, b3]);
      result = ctx.find(() => false);
      expect(result).to.be.eql([]);
      result = ctx.find(binding => binding.key.startsWith('ba'));
      expect(result).to.be.eql([b2, b3]);
      result = ctx.find(binding => binding.scope === BindingScope.SINGLETON);
      expect(result).to.be.eql([b1]);
      result = ctx.find(binding => binding.tagNames.includes('b'));
      expect(result).to.be.eql([b2, b3]);
    });
  });

  describe('findByTag with name pattern', () => {
    it('returns matching binding', () => {
      const b1 = ctx.bind('controllers.ProductController').tag('controller');
      ctx.bind('repositories.ProductRepository').tag('repository');
      const result = ctx.findByTag('controller');
      expect(result).to.be.eql([b1]);
    });

    it('returns matching binding with *', () => {
      const b1 = ctx.bind('controllers.ProductController').tag('controller');
      const b2 = ctx.bind('controllers.OrderController').tag('controller');
      const result = ctx.findByTag('c*');
      expect(result).to.be.eql([b1, b2]);
    });

    it('returns matching binding with regexp', () => {
      const b1 = ctx.bind('controllers.ProductController').tag('controller');
      const b2 = ctx
        .bind('controllers.OrderController')
        .tag('controller', 'rest');
      let result = ctx.findByTag(/controller/);
      expect(result).to.be.eql([b1, b2]);
      result = ctx.findByTag(/rest/);
      expect(result).to.be.eql([b2]);
    });
  });

  describe('findByTag with name/value filter', () => {
    it('returns matching binding', () => {
      const b1 = ctx
        .bind('controllers.ProductController')
        .tag({name: 'my-controller'});
      ctx.bind('controllers.OrderController').tag('controller');
      ctx.bind('dataSources.mysql').tag({dbType: 'mysql'});
      const result = ctx.findByTag({name: 'my-controller'});
      expect(result).to.be.eql([b1]);
    });

    it('returns empty array if no matching tag value is found', () => {
      ctx.bind('controllers.ProductController').tag({name: 'my-controller'});
      ctx.bind('controllers.OrderController').tag('controller');
      ctx.bind('dataSources.mysql').tag({dbType: 'mysql'});
      const result = ctx.findByTag({name: 'your-controller'});
      expect(result).to.be.eql([]);
    });
  });

  describe('getBinding', () => {
    it('returns the binding object registered under the given key', () => {
      const expected = ctx.bind('foo');
      const actual: Binding = ctx.getBinding('foo');
      expect(actual).to.equal(expected);
    });

    it('reports an error when binding is not found', () => {
      expect(() => ctx.getBinding('unknown-key')).to.throw(/unknown-key/);
    });

    it('returns undefined if an optional binding is not found', () => {
      const actual = ctx.getBinding('unknown-key', {optional: true});
      expect(actual).to.be.undefined();
    });

    it('rejects a key containing property separator', () => {
      const key = 'a' + BindingKey.PROPERTY_SEPARATOR + 'b';
      expect(() => ctx.getBinding(key)).to.throw(
        /Binding key .* cannot contain/,
      );
    });
  });

  describe('configure()', () => {
    it('configures options for a binding before it is bound', () => {
      const bindingForConfig = ctx.configure('foo').to({x: 1});
      expect(bindingForConfig.key).to.equal(
        BindingKey.buildKeyForConfig('foo'),
      );
      expect(bindingForConfig.tagMap).to.eql({config: 'foo'});
    });

    it('configures options for a binding after it is bound', () => {
      ctx.bind('foo').to('bar');
      const bindingForConfig = ctx.configure('foo').to({x: 1});
      expect(bindingForConfig.key).to.equal(
        BindingKey.buildKeyForConfig('foo'),
      );
      expect(bindingForConfig.tagMap).to.eql({config: 'foo'});
    });
  });

  describe('getConfig()', () => {
    it('gets config for a binding', async () => {
      ctx.configure('foo').toDynamicValue(() => Promise.resolve({x: 1}));
      expect(await ctx.getConfig('foo')).to.eql({x: 1});
    });

    it('gets local config for a binding', async () => {
      ctx
        .configure('foo')
        .toDynamicValue(() => Promise.resolve({a: {x: 0, y: 0}}));
      ctx.configure('foo.a').toDynamicValue(() => Promise.resolve({x: 1}));
      expect(
        await ctx.getConfig<number>('foo.a', 'x', {localConfigOnly: true}),
      ).to.eql(1);
      expect(
        await ctx.getConfig<number>('foo.a', 'y', {localConfigOnly: true}),
      ).to.be.undefined();
    });

    it('gets parent config for a binding', async () => {
      ctx
        .configure('foo')
        .toDynamicValue(() => Promise.resolve({a: {x: 0, y: 0}}));
      ctx.configure('foo.a').toDynamicValue(() => Promise.resolve({x: 1}));
      expect(await ctx.getConfig<number>('foo.a', 'x')).to.eql(1);
      expect(await ctx.getConfig<number>('foo.a', 'y')).to.eql(0);
    });

    it('defaults optional to true for config resolution', async () => {
      ctx.configure('servers').to({rest: {port: 80}});
      // `servers.rest` does not exist yet
      let server1port = await ctx.getConfig<number>('servers.rest', 'port');
      // The port is resolved at `servers` level
      expect(server1port).to.eql(80);

      // Now add `servers.rest`
      ctx.configure('servers.rest').to({port: 3000});
      const servers: BoundValue = await ctx.getConfig('servers');
      server1port = await ctx.getConfig<number>('servers.rest', 'port');
      // We don't add magic to merge `servers.rest` level into `servers`
      expect(servers.rest.port).to.equal(80);
      expect(server1port).to.eql(3000);
    });

    it('throws error if a required config cannot be resolved', async () => {
      ctx.configure('servers').to({rest: {port: 80}});
      // `servers.rest` does not exist yet
      let server1port = await ctx.getConfig<number>('servers.rest', 'port', {
        optional: false,
      });
      // The port is resolved at `servers` level
      expect(server1port).to.eql(80);

      expect(
        ctx.getConfig('servers.rest', 'host', {
          optional: false,
        }),
      )
        .to.be.rejectedWith(
          `Configuration 'servers.rest#host' cannot be resolved`,
        )
        .catch(e => {
          // Sink the error to avoid UnhandledPromiseRejectionWarning
        });
    });
  });

  describe('getConfigSync()', () => {
    it('gets config for a binding', () => {
      ctx.configure('foo').to({x: 1});
      expect(ctx.getConfigSync('foo')).to.eql({x: 1});
    });

    it('throws a helpful error when the config is async', () => {
      ctx.configure('foo').toDynamicValue(() => Promise.resolve('bar'));
      expect(() => ctx.getConfigSync('foo')).to.throw(
        /Cannot get config\[\] for foo synchronously: the value is a promise/,
      );
    });
  });

  describe('getSync', () => {
    it('returns the value immediately when the binding is sync', () => {
      ctx.bind('foo').to('bar');
      const result = ctx.getSync('foo');
      expect(result).to.equal('bar');
    });

    it('returns undefined if an optional binding is not found', () => {
      expect(ctx.getSync('unknown-key', {optional: true})).to.be.undefined();
    });

    it('returns the value with property separator', () => {
      const SEP = BindingKey.PROPERTY_SEPARATOR;
      const val = {x: {y: 'Y'}};
      ctx.bind('foo').to(val);
      const value = ctx.getSync(`foo${SEP}x`);
      expect(value).to.eql({y: 'Y'});
    });

    it('throws a helpful error when the binding is async', () => {
      ctx.bind('foo').toDynamicValue(() => Promise.resolve('bar'));
      expect(() => ctx.getSync('foo')).to.throw(/foo.*the value is a promise/);
    });

    it('returns singleton value', () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => count++)
        .inScope(BindingScope.SINGLETON);
      let result = ctx.getSync('foo');
      expect(result).to.equal(0);
      result = ctx.getSync('foo');
      expect(result).to.equal(0);
      const childCtx = new Context(ctx);
      result = childCtx.getSync('foo');
      expect(result).to.equal(0);
    });

    it('returns singleton value triggered by the child context', () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => count++)
        .inScope(BindingScope.SINGLETON);
      const childCtx = new Context(ctx);
      // Calculate the singleton value at child level 1st
      let result = childCtx.getSync('foo');
      expect(result).to.equal(0);
      // Try twice from the parent ctx
      result = ctx.getSync('foo');
      expect(result).to.equal(0);
      result = ctx.getSync('foo');
      expect(result).to.equal(0);
      // Try again from the child ctx
      result = childCtx.getSync('foo');
      expect(result).to.equal(0);
    });

    it('returns transient value', () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => count++)
        .inScope(BindingScope.TRANSIENT);
      let result = ctx.getSync('foo');
      expect(result).to.equal(0);
      result = ctx.getSync('foo');
      expect(result).to.equal(1);
      const childCtx = new Context(ctx);
      result = childCtx.getSync('foo');
      expect(result).to.equal(2);
    });

    it('returns context value', () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => count++)
        .inScope(BindingScope.CONTEXT);
      let result = ctx.getSync('foo');
      expect(result).to.equal(0);
      result = ctx.getSync('foo');
      expect(result).to.equal(0);
    });

    it('returns context value from a child context', () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => count++)
        .inScope(BindingScope.CONTEXT);
      let result = ctx.getSync('foo');
      expect(result).to.equal(0);
      const childCtx = new Context(ctx);
      result = childCtx.getSync('foo');
      expect(result).to.equal(1);
      result = childCtx.getSync('foo');
      expect(result).to.equal(1);
      const childCtx2 = new Context(ctx);
      result = childCtx2.getSync('foo');
      expect(result).to.equal(2);
      result = childCtx.getSync('foo');
      expect(result).to.equal(1);
    });
  });

  describe('getOwnerContext', () => {
    it('returns owner context', () => {
      ctx.bind('foo').to('bar');
      expect(ctx.getOwnerContext('foo')).to.equal(ctx);
    });

    it('returns owner context with parent', () => {
      ctx.bind('foo').to('bar');
      const childCtx = new Context(ctx, 'child');
      childCtx.bind('xyz').to('abc');
      expect(childCtx.getOwnerContext('foo')).to.equal(ctx);
      expect(childCtx.getOwnerContext('xyz')).to.equal(childCtx);
    });
  });

  describe('get', () => {
    it('returns a promise when the binding is async', async () => {
      ctx.bind('foo').toDynamicValue(() => Promise.resolve('bar'));
      const result = await ctx.get('foo');
      expect(result).to.equal('bar');
    });

    it('returns undefined if an optional binding is not found', async () => {
      expect(await ctx.get('unknown-key', {optional: true})).to.be.undefined();
    });

    it('returns the value with property separator', async () => {
      const SEP = BindingKey.PROPERTY_SEPARATOR;
      const val = {x: {y: 'Y'}};
      ctx.bind('foo').toDynamicValue(() => Promise.resolve(val));
      const value = await ctx.get(`foo${SEP}x`);
      expect(value).to.eql({y: 'Y'});
    });

    it('returns singleton value', async () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => Promise.resolve(count++))
        .inScope(BindingScope.SINGLETON);
      let result = await ctx.get('foo');
      expect(result).to.equal(0);
      result = await ctx.get('foo');
      expect(result).to.equal(0);
      const childCtx = new Context(ctx);
      result = await childCtx.get('foo');
      expect(result).to.equal(0);
    });

    it('returns context value', async () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => Promise.resolve(count++))
        .inScope(BindingScope.CONTEXT);
      let result = await ctx.get('foo');
      expect(result).to.equal(0);
      result = await ctx.get('foo');
      expect(result).to.equal(0);
    });

    it('returns context value from a child context', async () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => Promise.resolve(count++))
        .inScope(BindingScope.CONTEXT);
      let result = await ctx.get('foo');
      const childCtx = new Context(ctx);
      expect(result).to.equal(0);
      result = await childCtx.get('foo');
      expect(result).to.equal(1);
      result = await childCtx.get('foo');
      expect(result).to.equal(1);
      const childCtx2 = new Context(ctx);
      result = await childCtx2.get('foo');
      expect(result).to.equal(2);
      result = await childCtx.get('foo');
      expect(result).to.equal(1);
    });

    it('returns transient value', async () => {
      let count = 0;
      ctx
        .bind('foo')
        .toDynamicValue(() => Promise.resolve(count++))
        .inScope(BindingScope.TRANSIENT);
      let result = await ctx.get('foo');
      expect(result).to.equal(0);
      result = await ctx.get('foo');
      expect(result).to.equal(1);
      const childCtx = new Context(ctx);
      result = await childCtx.get('foo');
      expect(result).to.equal(2);
    });
  });

  describe('getValueOrPromise', () => {
    it('returns synchronously for constant values', () => {
      ctx.bind('key').to('value');
      const valueOrPromise = ctx.getValueOrPromise('key');
      expect(valueOrPromise).to.equal('value');
    });

    it('returns undefined if an optional binding is not found', () => {
      expect(
        ctx.getValueOrPromise('unknown-key', {optional: true}),
      ).to.be.undefined();
    });

    it('returns promise for async values', async () => {
      ctx.bind('key').toDynamicValue(() => Promise.resolve('value'));
      const valueOrPromise = ctx.getValueOrPromise<string>('key');
      expect(isPromiseLike(valueOrPromise)).to.be.true();
      const value = await valueOrPromise;
      expect(value).to.equal('value');
    });

    it('returns nested property (synchronously)', () => {
      ctx.bind('key').to({test: 'test-value'});
      const value = ctx.getValueOrPromise('key#test');
      expect(value).to.equal('test-value');
    });

    it('returns nested property (asynchronously)', async () => {
      ctx
        .bind('key')
        .toDynamicValue(() => Promise.resolve({test: 'test-value'}));
      const valueOrPromise = ctx.getValueOrPromise<string>('key#test');
      expect(isPromiseLike(valueOrPromise)).to.be.true();
      const value = await valueOrPromise;
      expect(value).to.equal('test-value');
    });

    it('supports deeply nested property path', () => {
      ctx.bind('key').to({x: {y: 'z'}});
      const value = ctx.getValueOrPromise('key#x.y');
      expect(value).to.equal('z');
    });

    it('returns undefined when nested property does not exist', () => {
      ctx.bind('key').to({test: 'test-value'});
      const value = ctx.getValueOrPromise('key#x.y');
      expect(value).to.equal(undefined);
    });

    it('honours TRANSIENT scope when retrieving a nested property', () => {
      const state = {count: 0};
      ctx
        .bind('state')
        .toDynamicValue(() => {
          state.count++;
          return state;
        })
        .inScope(BindingScope.TRANSIENT);
      // verify the initial state & populate the cache
      expect(ctx.getSync('state')).to.deepEqual({count: 1});
      // retrieve a nested property (expect a new value)
      expect(ctx.getSync('state#count')).to.equal(2);
      // retrieve the full object again (expect another new value)
      expect(ctx.getSync('state')).to.deepEqual({count: 3});
    });

    it('honours CONTEXT scope when retrieving a nested property', () => {
      const state = {count: 0};
      ctx
        .bind('state')
        .toDynamicValue(() => {
          state.count++;
          return state;
        })
        .inScope(BindingScope.CONTEXT);
      // verify the initial state & populate the cache
      expect(ctx.getSync('state')).to.deepEqual({count: 1});
      // retrieve a nested property (expect the cached value)
      expect(ctx.getSync('state#count')).to.equal(1);
      // retrieve the full object again (verify that cache was not modified)
      expect(ctx.getSync('state')).to.deepEqual({count: 1});
    });

    it('honours SINGLETON scope when retrieving a nested property', () => {
      const state = {count: 0};
      ctx
        .bind('state')
        .toDynamicValue(() => {
          state.count++;
          return state;
        })
        .inScope(BindingScope.SINGLETON);

      // verify the initial state & populate the cache
      expect(ctx.getSync('state')).to.deepEqual({count: 1});

      // retrieve a nested property from a child context
      const childContext1 = new Context(ctx);
      expect(childContext1.getValueOrPromise('state#count')).to.equal(1);

      // retrieve a nested property from another child context
      const childContext2 = new Context(ctx);
      expect(childContext2.getValueOrPromise('state#count')).to.equal(1);

      // retrieve the full object again (verify that cache was not modified)
      expect(ctx.getSync('state')).to.deepEqual({count: 1});
    });
  });

  describe('toJSON()', () => {
    it('converts to plain JSON object', () => {
      ctx
        .bind('a')
        .to('1')
        .lock();
      ctx
        .bind('b')
        .toDynamicValue(() => 2)
        .inScope(BindingScope.SINGLETON)
        .tag('X', 'Y');
      ctx
        .bind('c')
        .to(3)
        .tag('Z', {a: 1});
      expect(ctx.toJSON()).to.eql({
        a: {
          key: 'a',
          scope: BindingScope.TRANSIENT,
          tags: {},
          isLocked: true,
          type: BindingType.CONSTANT,
        },
        b: {
          key: 'b',
          scope: BindingScope.SINGLETON,
          tags: {X: 'X', Y: 'Y'},
          isLocked: false,
          type: BindingType.DYNAMIC_VALUE,
        },
        c: {
          key: 'c',
          scope: BindingScope.TRANSIENT,
          tags: {Z: 'Z', a: 1},
          isLocked: false,
          type: BindingType.CONSTANT,
        },
      });
    });
  });

  function createContext() {
    ctx = new Context();
  }
});
