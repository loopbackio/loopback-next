// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, sinon, SinonSpy} from '@loopback/testlab';
import {
  Binding,
  BindingScope,
  BindingType,
  Context,
  inject,
  Provider,
} from '../..';

const key = 'foo';

describe('Binding', () => {
  let ctx: Context;
  let binding: Binding;
  beforeEach(givenBinding);

  describe('constructor', () => {
    it('sets the given key', () => {
      const result = binding.key;
      expect(result).to.equal(key);
    });

    it('sets the binding lock state to unlocked by default', () => {
      expect(binding.isLocked).to.be.false();
    });

    it('leaves other states to `undefined` by default', () => {
      expect(binding.type).to.be.undefined();
      expect(binding.valueConstructor).to.be.undefined();
    });
  });

  describe('lock', () => {
    it('locks the binding', () => {
      binding.lock();
      expect(binding.isLocked).to.be.true();
    });
  });

  describe('tag', () => {
    it('tags the binding', () => {
      binding.tag('t1');
      expect(binding.tagNames).to.eql(['t1']);
      binding.tag('t2');
      expect(binding.tagNames).to.eql(['t1', 't2']);
      expect(binding.tagMap).to.eql({t1: 't1', t2: 't2'});
    });

    it('tags the binding with rest args', () => {
      binding.tag('t1', 't2');
      expect(binding.tagNames).to.eql(['t1', 't2']);
    });

    it('tags the binding with name/value', () => {
      binding.tag({name: 'my-controller'});
      expect(binding.tagNames).to.eql(['name']);
      expect(binding.tagMap).to.eql({name: 'my-controller'});
    });

    it('tags the binding with names and name/value objects', () => {
      binding.tag('controller', {name: 'my-controller'}, 'rest');
      expect(binding.tagNames).to.eql(['controller', 'name', 'rest']);
      expect(binding.tagMap).to.eql({
        controller: 'controller',
        name: 'my-controller',
        rest: 'rest',
      });
    });

    it('throws an error if one of the arguments is an array', () => {
      expect(() => binding.tag(['t1', 't2'])).to.throw(
        /Tag must be a string or an object \(but not array\):/,
      );
    });
  });

  describe('inScope', () => {
    it('defaults to `TRANSIENT` binding scope', () => {
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    });

    it('sets the singleton binding scope', () => {
      binding.inScope(BindingScope.SINGLETON);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
    });

    it('sets the context binding scope', () => {
      binding.inScope(BindingScope.CONTEXT);
      expect(binding.scope).to.equal(BindingScope.CONTEXT);
    });

    it('sets the transient binding scope', () => {
      binding.inScope(BindingScope.TRANSIENT);
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    });
  });

  describe('applyDefaultScope', () => {
    it('sets the scope if not set', () => {
      binding.applyDefaultScope(BindingScope.SINGLETON);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
    });

    it('does not override the existing scope', () => {
      binding.inScope(BindingScope.TRANSIENT);
      binding.applyDefaultScope(BindingScope.SINGLETON);
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    });
  });

  describe('to(value)', () => {
    it('returns the value synchronously', () => {
      binding.to('value');
      expect(binding.getValue(ctx)).to.equal('value');
    });

    it('sets the type to CONSTANT', () => {
      binding.to('value');
      expect(binding.type).to.equal(BindingType.CONSTANT);
    });

    it('rejects promise values', () => {
      expect(() => binding.to(Promise.resolve('value'))).to.throw(
        /Promise instances are not allowed.*toDynamicValue/,
      );
    });

    it('rejects rejected promise values', () => {
      const p = Promise.reject('error');
      expect(() => binding.to(p)).to.throw(
        /Promise instances are not allowed.*toDynamicValue/,
      );
      // Catch the rejected promise to avoid
      // (node:60994) UnhandledPromiseRejectionWarning: Unhandled promise
      // rejection (rejection id: 1): error
      p.catch(e => {});
    });
  });

  describe('toDynamicValue(dynamicValueFn)', () => {
    it('support a factory', async () => {
      const b = ctx.bind('msg').toDynamicValue(() => Promise.resolve('hello'));
      const value = await ctx.get<string>('msg');
      expect(value).to.equal('hello');
      expect(b.type).to.equal(BindingType.DYNAMIC_VALUE);
    });
  });

  describe('toClass(cls)', () => {
    it('support a class', async () => {
      ctx.bind('msg').toDynamicValue(() => Promise.resolve('world'));
      const b = ctx.bind('myService').toClass(MyService);
      expect(b.type).to.equal(BindingType.CLASS);
      const myService = await ctx.get<MyService>('myService');
      expect(myService.getMessage()).to.equal('hello world');
    });
  });

  describe('toProvider(provider)', () => {
    it('binding returns the expected value', async () => {
      ctx.bind('msg').to('hello');
      ctx.bind('provider_key').toProvider(MyProvider);
      const value = await ctx.get<string>('provider_key');
      expect(value).to.equal('hello world');
    });

    it('can resolve provided value synchronously', () => {
      ctx.bind('msg').to('hello');
      ctx.bind('provider_key').toProvider(MyProvider);
      const value: string = ctx.getSync('provider_key');
      expect(value).to.equal('hello world');
    });

    it('support asynchronous dependencies of provider class', async () => {
      ctx.bind('msg').toDynamicValue(() => Promise.resolve('hello'));
      ctx.bind('provider_key').toProvider(MyProvider);
      const value = await ctx.get<string>('provider_key');
      expect(value).to.equal('hello world');
    });

    it('sets the type to PROVIDER', () => {
      ctx.bind('msg').to('hello');
      const b = ctx.bind('provider_key').toProvider(MyProvider);
      expect(b.type).to.equal(BindingType.PROVIDER);
    });
  });

  describe('toAlias(bindingKeyWithPath)', () => {
    it('binds to another binding with sync value', () => {
      ctx.bind('parent.options').to({child: {disabled: true}});
      ctx.bind('child.options').toAlias('parent.options#child');
      const childOptions = ctx.getSync('child.options');
      expect(childOptions).to.eql({disabled: true});
    });

    it('creates the alias even when the target is not bound yet', () => {
      ctx.bind('child.options').toAlias('parent.options#child');
      ctx.bind('parent.options').to({child: {disabled: true}});
      const childOptions = ctx.getSync('child.options');
      expect(childOptions).to.eql({disabled: true});
    });

    it('binds to another binding with async value', async () => {
      ctx
        .bind('parent.options')
        .toDynamicValue(() => Promise.resolve({child: {disabled: true}}));
      ctx.bind('child.options').toAlias('parent.options#child');
      const childOptions = await ctx.get('child.options');
      expect(childOptions).to.eql({disabled: true});
    });

    it('reports error if alias binding cannot be resolved', () => {
      ctx.bind('child.options').toAlias('parent.options#child');
      expect(() => ctx.getSync('child.options')).to.throw(
        /The key 'parent.options' is not bound to any value in context/,
      );
    });

    it('reports error if alias binding cannot be resolved - async', async () => {
      ctx.bind('child.options').toAlias('parent.options#child');
      return expect(ctx.get('child.options')).to.be.rejectedWith(
        /The key 'parent.options' is not bound to any value in context/,
      );
    });

    it('allows optional if binding does not have a value getter', () => {
      // This can happen for `@inject.binding`
      ctx.bind('child.options');
      const childOptions = ctx.getSync('child.options', {optional: true});
      expect(childOptions).to.be.undefined();
    });

    it('allows optional if alias binding cannot be resolved', () => {
      ctx.bind('child.options').toAlias('parent.options#child');
      const childOptions = ctx.getSync('child.options', {optional: true});
      expect(childOptions).to.be.undefined();
    });

    it('allows optional if alias binding cannot be resolved - async', async () => {
      ctx.bind('child.options').toAlias('parent.options#child');
      const childOptions = await ctx.get('child.options', {optional: true});
      expect(childOptions).to.be.undefined();
    });

    it('sets type to ALIAS', () => {
      const childBinding = ctx
        .bind('child.options')
        .toAlias('parent.options#child');
      expect(childBinding.type).to.equal(BindingType.ALIAS);
    });
  });

  describe('apply(templateFn)', () => {
    it('applies a template function', async () => {
      binding.apply(b => {
        b.inScope(BindingScope.SINGLETON).tag('myTag');
      });
      expect(binding.scope).to.eql(BindingScope.SINGLETON);
      expect(binding.tagNames).to.eql(['myTag']);
    });

    it('applies multiple template functions', async () => {
      binding.apply(
        b => {
          b.inScope(BindingScope.SINGLETON);
        },
        b => {
          b.tag('myTag');
        },
      );
      expect(binding.scope).to.eql(BindingScope.SINGLETON);
      expect(binding.tagNames).to.eql(['myTag']);
    });

    it('sets up a placeholder value', async () => {
      const toBeBound = (b: Binding<unknown>) => {
        b.toDynamicValue(() => {
          throw new Error(`Binding ${b.key} is not bound to a value yet`);
        });
      };
      binding.apply(toBeBound);
      ctx.add(binding);
      await expect(ctx.get(binding.key)).to.be.rejectedWith(
        /Binding foo is not bound to a value yet/,
      );
    });
  });

  describe('cache', () => {
    let spy: SinonSpy;
    beforeEach(() => {
      spy = sinon.spy();
    });

    it('clears cache if scope changes', () => {
      const indexBinding = ctx
        .bind<number>('index')
        .toDynamicValue(spy)
        .inScope(BindingScope.SINGLETON);

      ctx.getSync(indexBinding.key);
      sinon.assert.calledOnce(spy);
      spy.resetHistory();

      // Singleton
      ctx.getSync(indexBinding.key);
      sinon.assert.notCalled(spy);
      spy.resetHistory();

      indexBinding.inScope(BindingScope.CONTEXT);
      ctx.getSync(indexBinding.key);
      sinon.assert.calledOnce(spy);
    });

    it('clears cache if _getValue changes', () => {
      const providerSpy = sinon.spy();
      class IndexProvider implements Provider<number> {
        value() {
          return providerSpy();
        }
      }
      const indexBinding = ctx
        .bind<number>('index')
        .toDynamicValue(spy)
        .inScope(BindingScope.SINGLETON);

      ctx.getSync(indexBinding.key);
      sinon.assert.calledOnce(spy);
      spy.resetHistory();

      // Singleton
      ctx.getSync(indexBinding.key);
      sinon.assert.notCalled(spy);
      spy.resetHistory();

      // Now change the value getter
      indexBinding.toProvider(IndexProvider);
      ctx.getSync(indexBinding.key);
      sinon.assert.notCalled(spy);
      sinon.assert.calledOnce(providerSpy);
      spy.resetHistory();
      providerSpy.resetHistory();

      // Singleton
      ctx.getSync(indexBinding.key);
      sinon.assert.notCalled(spy);
      sinon.assert.notCalled(providerSpy);
    });
  });

  describe('toJSON()', () => {
    it('converts a keyed binding to plain JSON object', () => {
      const json = binding.toJSON();
      expect(json).to.eql({
        key: key,
        scope: BindingScope.TRANSIENT,
        tags: {},
        isLocked: false,
      });
    });

    it('converts a binding with more attributes to plain JSON object', () => {
      const myBinding = new Binding(key, true)
        .inScope(BindingScope.CONTEXT)
        .tag('model', {name: 'my-model'})
        .to('a');
      const json = myBinding.toJSON();
      expect(json).to.eql({
        key: key,
        scope: BindingScope.CONTEXT,
        tags: {model: 'model', name: 'my-model'},
        isLocked: true,
        type: BindingType.CONSTANT,
      });
    });
  });

  function givenBinding() {
    ctx = new Context();
    binding = new Binding(key);
  }

  class MyProvider implements Provider<string> {
    constructor(@inject('msg') private _msg: string) {}
    value(): string {
      return this._msg + ' world';
    }
  }

  class MyService {
    constructor(@inject('msg') private _msg: string) {}

    getMessage(): string {
      return 'hello ' + this._msg;
    }
  }
});
