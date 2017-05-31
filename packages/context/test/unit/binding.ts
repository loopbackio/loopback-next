// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Binding, Context, inject, Provider} from '../..';

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

    it('sets the binding lock state to unlocked by default',  () => {
      expect(binding.isLocked).to.be.false();
    });
  });

  describe('lock', () => {
    it('locks the binding', () => {
      binding.lock();
      expect(binding.isLocked).to.be.true();
    });
  });

  describe('to(value)', () => {
    it('returns the value synchronously', () => {
      binding.to('value');
      expect(binding.getValue(ctx)).to.equal('value');
    });
  });

  describe('getProviderInstance(ctx)', () => {
    it('returns error when no provider is attached', async () => {
      let err;
      try {
        await binding.getProviderInstance<String>(ctx);
      } catch (exception) {
        err = exception;
        expect(exception.message).to.equal('No provider is attached to binding foo.');
      }
      expect(err).to.not.to.be.undefined();
    });
  });

  describe('toProvider(provider)', () => {
    it('attaches a provider class to the binding', async () => {
      ctx.bind('msg').to('hello');
      binding.toProvider(MyProvider);
      const providerInstance: Provider<String> = await binding.getProviderInstance<String>(ctx);
      expect(providerInstance).to.be.instanceOf(MyProvider);
    });

    it('provider instance is injected with constructor arguments', async () => {
      ctx.bind('msg').to('hello');
      binding.toProvider(MyProvider);
      const providerInstance: Provider<String> = await binding.getProviderInstance<String>(ctx);
      expect(providerInstance.value()).to.equal('hello world');
    });

    it('binding returns the expected value', async () => {
      ctx.bind('msg').to('hello');
      ctx.bind('provider_key').toProvider(MyProvider);
      const value: String = await ctx.get('provider_key');
      expect(value).to.equal('hello world');
    });
  });

  function givenBinding() {
    ctx = new Context();
    binding = new Binding(key);
  }

  class MyProvider implements Provider<String> {
    constructor(@inject('msg') private _msg: string) {}
    value(): String {
      return this._msg + ' world';
    }
  }
});
