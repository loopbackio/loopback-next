// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Binding, BindingScope, isPromise} from '../..';

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
      const key = 'a' + Binding.PROPERTY_SEPARATOR + 'b';
      expect(() => ctx.bind(key)).to.throw(/Binding key .* cannot contain/);
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
  });

  describe('findByTag', () => {
    it('returns matching binding', () => {
      const b1 = ctx.bind('foo').tag('t1');
      ctx.bind('bar').tag('t2');
      const result = ctx.findByTag('t1');
      expect(result).to.be.eql([b1]);
    });

    it('returns matching binding with *', () => {
      const b1 = ctx.bind('foo').tag('t1');
      const b2 = ctx.bind('bar').tag('t2');
      const result = ctx.findByTag('t*');
      expect(result).to.be.eql([b1, b2]);
    });
  });

  describe('getBinding', () => {
    it('returns the binding object registered under the given key', () => {
      const expected = ctx.bind('foo');
      const actual = ctx.getBinding('foo');
      expect(actual).to.equal(expected);
    });

    it('reports an error when binding was not found', () => {
      expect(() => ctx.getBinding('unknown-key')).to.throw(/unknown-key/);
    });

    it('rejects a key containing property separator', () => {
      const key = 'a' + Binding.PROPERTY_SEPARATOR + 'b';
      expect(() => ctx.getBinding(key)).to.throw(
        /Binding key .* cannot contain/,
      );
    });
  });

  describe('getSync', () => {
    it('returns the value immediately when the binding is sync', () => {
      ctx.bind('foo').to('bar');
      const result = ctx.getSync('foo');
      expect(result).to.equal('bar');
    });

    it('returns a nested property of the value', () => {
      const val = {x: {y: 'Y'}};
      ctx.bind('foo').to(val);
      const value = ctx.getSync('foo', {property: 'x'});
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

  describe('get', () => {
    it('returns a promise when the binding is async', async () => {
      ctx.bind('foo').to(Promise.resolve('bar'));
      const result = await ctx.get('foo');
      expect(result).to.equal('bar');
    });

    it('returns a nested property of the value', async () => {
      const val = {x: {y: 'Y'}};
      ctx.bind('foo').to(Promise.resolve(val));
      const value = await ctx.get('foo', {property: 'x'});
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

    it('returns promise for async values', async () => {
      ctx.bind('key').toDynamicValue(() => Promise.resolve('value'));
      const valueOrPromise = ctx.getValueOrPromise('key');
      expect(isPromise(valueOrPromise)).to.be.true();
      const value = await valueOrPromise;
      expect(value).to.equal('value');
    });

    it('returns nested property (synchronously)', () => {
      ctx.bind('key').to({test: 'test-value'});
      const value = ctx.getValueOrPromise('key', {property: 'test'});
      expect(value).to.equal('test-value');
    });

    it('returns nested property (asynchronously)', async () => {
      ctx.bind('key').to(Promise.resolve({test: 'test-value'}));
      const value = await ctx.getValueOrPromise('key', {property: 'test'});
      expect(value).to.equal('test-value');
    });

    it('supports deeply nested property path', () => {
      ctx.bind('key').to({x: {y: 'z'}});
      const value = ctx.getValueOrPromise('key', {property: 'x.y'});
      expect(value).to.equal('z');
    });

    it('returns undefined when nested property does not exist', () => {
      ctx.bind('key').to({test: 'test-value'});
      const value = ctx.getValueOrPromise('key', {property: 'x.y'});
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
      expect(ctx.getValueOrPromise('state')).to.deepEqual({count: 1});
      // retrieve a nested property (expect a new value)
      expect(ctx.getValueOrPromise('state', {property: 'count'})).to.equal(2);
      // retrieve the full object again (expect another new value)
      expect(ctx.getValueOrPromise('state')).to.deepEqual({count: 3});
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
      expect(ctx.getValueOrPromise('state')).to.deepEqual({count: 1});
      // retrieve a nested property (expect the cached value)
      expect(ctx.getValueOrPromise('state', {property: 'count'})).to.equal(1);
      // retrieve the full object again (verify that cache was not modified)
      expect(ctx.getValueOrPromise('state')).to.deepEqual({count: 1});
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
      expect(ctx.getValueOrPromise('state')).to.deepEqual({count: 1});

      // retrieve a nested property from a child context
      const childContext1 = new Context(ctx);
      expect(
        childContext1.getValueOrPromise('state', {property: 'count'}),
      ).to.equal(1);

      // retrieve a nested property from another child context
      const childContext2 = new Context(ctx);
      expect(
        childContext2.getValueOrPromise('state', {property: 'count'}),
      ).to.equal(1);

      // retrieve the full object again (verify that cache was not modified)
      expect(ctx.getValueOrPromise('state')).to.deepEqual({count: 1});
    });
  });

  function createContext() {
    ctx = new Context();
  }
});
