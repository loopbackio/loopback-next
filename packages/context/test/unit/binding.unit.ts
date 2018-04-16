// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
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
    it('defaults the transient binding scope', () => {
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
