// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {asRunnable, HandlerChain} from '../..';

describe('Handler', () => {
  describe('asRunnable()', () => {
    it('should execute phase handlers', async () => {
      const context = {
        called: [],
      };
      const run = asRunnable([
        async ctx => {
          ctx.called.push('foo');
        },
        async ctx => {
          ctx.called.push('bar');
        },
      ]);
      await run(context);
      expect(context.called).eql(['foo', 'bar']);
    });

    it('should allow handlerChain.next()', async () => {
      const context = {
        called: [],
      };
      const run = asRunnable([
        async (ctx, chain) => {
          ctx.called.push('foo');
          await chain.next();
          ctx.called.push('foo-done');
        },
        async ctx => {
          ctx.called.push('bar');
        },
      ]);
      await run(context);
      expect(context.called).eql(['foo', 'bar', 'foo-done']);
    });

    it('should allow handlerChain.stop()', async () => {
      const context = {
        called: [],
      };
      const run = asRunnable([
        async (ctx, chain) => {
          ctx.called.push('foo');
          chain.stop();
          ctx.called.push('foo-done');
        },
        async ctx => {
          ctx.called.push('bar');
        },
      ]);
      await run(context);
      expect(context.called).eql(['foo', 'foo-done']);
    });

    it('should allow handlerChain.throw()', async () => {
      const context = {
        called: [],
      };
      const run = asRunnable([
        async (ctx, chain) => {
          ctx.called.push('foo');
          chain.throw(new Error('foo fails'));
          ctx.called.push('foo-done');
        },
        async ctx => {
          ctx.called.push('bar');
        },
      ]);
      await expect(run(context)).to.be.rejectedWith('foo fails');
      expect(context.called).eql(['foo']);
    });

    it('should execute phase handlers in parallel', async () => {
      const context = {
        called: [],
        done: false,
      };
      const run = asRunnable(
        [
          async ctx => {
            ctx.called.push('foo');
          },
          async ctx => {
            ctx.called.push('bar');
          },
        ],
        {parallel: true},
      );
      await run(context);
      expect(context.called).containEql('foo');
      expect(context.called).containEql('bar');
      expect(context.done).to.be.false();
    });
  });
});

describe('HandlerChain', () => {
  let chain: HandlerChain;
  let called: string[] = [];

  beforeEach(() => {
    called = [];
    chain = new HandlerChain({}, [
      async ctx => {
        called.push('1');
      },
      async ctx => {
        called.push('2');
      },
    ]);
  });
  it('allows next()', async () => {
    await chain.next();
    expect(called).to.eql(['2']);
  });

  it('allows stop()', () => {
    chain.stop();
    expect(chain.done).to.be.true();
  });

  it('allows throw()', () => {
    expect(() => chain.throw(new Error('err'))).to.throw('err');
  });

  it('does not allow next() to be called after done', async () => {
    await chain.next();
    return expect(chain.next()).to.be.rejectedWith(
      'The handler chain is done.',
    );
  });

  it('does not allow next() to be called after stop', () => {
    chain.stop();
    return expect(chain.next()).to.be.rejectedWith(
      'The handler chain is done.',
    );
  });
});
