// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Binding, inject, ValueProvider} from '../..';
import {MockValueProvider, MockFunctionProvider, MockConstructorProvider, MockLoopbackController} from './fixtures/mock-binding-providers';

describe('Context', () => {
  let ctx: Context;
  before('given a context', createContext);

  describe('bind', () => {
    let binding: Binding;
    before('create a binding', createBinding);

    it('adds a binding into the registry', () => {
      const result = ctx.contains('foo');
      expect(result).to.be.true();
    });

    it('returns a binding', () => {
      expect(binding).to.be.instanceOf(Binding);
    });

    function createBinding() {
      binding = ctx.bind('foo');
    }
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

  describe('getBinding', () => {
    it('returns the binding object registered under the given key', () => {
      const expected = ctx.bind('foo');
      const actual = ctx.getBinding('foo');
      expect(actual).to.equal(expected);
    });

    it('reports an error when binding was not found', () => {
      expect(() => ctx.getBinding('unknown-key')).to.throw(/unknown-key/);
    });
  });

  describe('getSync', () => {
    it('returns the value immediately when the binding is sync', () => {
      ctx.bind('foo').to('bar');
      const result = ctx.getSync('foo');
      expect(result).to.equal('bar');
    });

    it('throws a helpful error when the binding is async', () => {
      ctx.bind('foo').toDynamicValue(() => Promise.resolve('bar'));
      expect(() => ctx.getSync('foo')).to.throw(/foo.*async/);
    });
  });

  describe('context.bind().toProvider()', () => {
    describe('ValueProvider', () => {
      it('binds a provider class to a context', () => {
        ctx.bind('foo').toProvider(MockValueProvider);
        expect(ctx.contains('foo')).to.be.true();
      });

      it('binding.getValue() injects constructor values in the Provider Class', async () => {
        ctx.bind('msg').to('hello');
        ctx.bind('foo').toProvider(MockValueProvider);
        const value: string = await ctx.getBinding('foo').getValue(ctx);
        expect(value).to.equal('hello world');
      });

      it('binding.getValue() returns the same value as provider.value()', async () => {
        ctx.bind('msg').to('hello');
        ctx.bind('foo').toProvider(MockValueProvider);
        const providerInstance = new MockValueProvider('hello');
        const value: string = await ctx.getBinding('foo').getValue(ctx);
        expect(value).to.equal(providerInstance.value(ctx));
      });
    });

    describe('FunctionProvider', () => {
      let provider: MockFunctionProvider;
      let date: Date;
      let prefix: string;

      beforeEach(givenProvider);

      it('binds a provider class to a context', () => {
        ctx.bind('foo').toProvider(MockFunctionProvider);
        expect(ctx.contains('foo')).to.be.true();
      });

      it('binding.getValue() injects constructor values in the Provider Class', async () => {
        ctx.bind('now').to(date);
        ctx.bind('prefix').to(prefix);
        ctx.bind('foo').toProvider(MockFunctionProvider);
        const value: string = await ctx.getBinding('foo').getValue(ctx);
        expect(value).to.equal(prefix + ' ' + date);
      });

      it('binding.getValue() returns the same value as provider.value()', async () => {
        ctx.bind('now').to(date);
        ctx.bind('prefix').to(prefix);
        ctx.bind('foo').toProvider(MockFunctionProvider);
        const value: string = await ctx.getBinding('foo').getValue(ctx);
        const providerInstance = new MockFunctionProvider(date, prefix);
        const providerInstanceValue = await providerInstance.value(ctx);
        expect(value).to.equal(providerInstanceValue);
      });

      function givenProvider() {
        date = new Date();
        prefix = 'Time is';
        provider = new MockFunctionProvider(date, prefix);
      }
    });

    describe('ConstructorProvider', () => {
      let provider: MockConstructorProvider;

      beforeEach(givenProvider);

      it('binds a provider class to a context', () => {
        ctx.bind('foo').toProvider(MockConstructorProvider);
        expect(ctx.contains('foo')).to.be.true();
      });

      it('binding.getValue() injects constructor values in the Provider Class', async () => {
        ctx.bind('arg1').to('hello');
        ctx.bind('param').to('world');
        ctx.bind('foo').toProvider(MockConstructorProvider);
        const value: string = await ctx.getBinding('foo').getValue(ctx);
        expect(value).to.be.instanceof(MockLoopbackController);
      });

      it('binding.getValue() is an instance of constructor returned by provider.source()', async () => {
        ctx.bind('arg1').to('hello');
        ctx.bind('param').to('world');
        ctx.bind('foo').toProvider(MockConstructorProvider);
        const providerInstance = new MockConstructorProvider('hello');
        const value: string = await ctx.getBinding('foo').getValue(ctx);
        expect(value).to.be.instanceof(providerInstance.source());
      });

      function givenProvider() {
        provider = new MockConstructorProvider('hello');
      }
    });
  });

  function createContext() {
    ctx = new Context();
  }
});
