// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Binding} from '../..';

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
      expect(() =>
        ctx.bind(key)).to.throw(/Binding key .* cannot contain/);
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
      const b2 = ctx.bind('bar');
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
      const b2 = ctx.bind('bar').tag('t2');
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
  });

  describe('getSync', () => {
    it('returns the value immediately when the binding is sync', () => {
      ctx.bind('foo').to('bar');
      const result = ctx.getSync('foo');
      expect(result).to.equal('bar');
    });

    it('returns the value with property separator', () => {
      const SEP = Binding.PROPERTY_SEPARATOR;
      const val = {x: {y: 'Y'}};
      ctx.bind('foo').to(val);
      let result = ctx.getSync('foo');
      expect(result).to.equal(val);
      result = ctx.getSync(`foo${SEP}x`);
      expect(result).to.eql({y: `Y`});
      result = ctx.getSync(`foo${SEP}x.y`);
      expect(result).to.eql('Y');
      result = ctx.getSync(`foo${SEP}z`);
      expect(result).to.be.undefined();
      result = ctx.getSync(`foo${SEP}x.y.length`);
      expect(result).to.eql(1);
    });

    it('throws a helpful error when the binding is async', () => {
      ctx.bind('foo').toDynamicValue(() => Promise.resolve('bar'));
      expect(() => ctx.getSync('foo')).to.throw(/foo.*the value is a promise/);
    });
  });

  describe('get', () => {
    it('returns a promise when the binding is async', async () => {
      ctx.bind('foo').to(Promise.resolve('bar'));
      const result = await ctx.get('foo');
      expect(result).to.equal('bar');
    });

    it('returns the value with property separator', async () => {
      const SEP = Binding.PROPERTY_SEPARATOR;
      const val = {x: {y: 'Y'}};
      ctx.bind('foo').to(Promise.resolve(val));
      let result = await ctx.get('foo');
      expect(result).to.equal(val);
      result = await ctx.get(`foo${SEP}x`);
      expect(result).to.eql({y: `Y`});
      result = await ctx.get(`foo${SEP}x.y`);
      expect(result).to.eql('Y');
      result = await ctx.get(`foo${SEP}z`);
      expect(result).to.be.undefined();
      result = await ctx.get(`foo${SEP}x.y.length`);
      expect(result).to.eql(1);
    });
  });

  function createContext() {
    ctx = new Context();
  }
});
