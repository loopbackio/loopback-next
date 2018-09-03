// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as assert from 'assert';
import {Handler, Phase} from '../..';

describe('Phase', () => {
  describe('phase.run(ctx)', () => {
    it('should execute phase handlers', async () => {
      const phase = new Phase();
      let called: boolean | undefined;
      phase.use(async ctx => {
        called = true;
      });
      await phase.run();
      assert(called === true);
    });

    it('should set the context for handlers', async () => {
      const phase = new Phase();
      phase.use(async ctx => {
        expect(ctx).to.have.property('foo', 'bar');
      });
      await phase.run({foo: 'bar'});
    });

    describe('execution order', () => {
      let called: string[];
      let mockHandler: (name: string) => Handler;

      beforeEach(() => {
        called = [];
        mockHandler = function(name: string) {
          return ctx => {
            called.push(name);
            return new Promise<void>(resolve => {
              process.nextTick(() => {
                called.push(name + '_done');
                resolve();
              });
            });
          };
        };
      });

      it('should execute phase handlers in parallel', async () => {
        const phase = new Phase({parallel: true});

        phase
          .before(mockHandler('beforeHandler_1'))
          .before(mockHandler('beforeHandler_2'))
          .use(mockHandler('handler_1'))
          .after(mockHandler('afterHandler_1'))
          .after(mockHandler('afterHandler_2'))
          .use(mockHandler('handler_2'));

        await phase.run();
        expect(called).to.eql([
          'beforeHandler_1',
          'beforeHandler_2',
          'beforeHandler_1_done',
          'beforeHandler_2_done',
          'handler_1',
          'handler_2',
          'handler_1_done',
          'handler_2_done',
          'afterHandler_1',
          'afterHandler_2',
          'afterHandler_1_done',
          'afterHandler_2_done',
        ]);
      });

      it('should execute phase handlers in serial', async () => {
        const phase = new Phase('x');

        phase
          .before(mockHandler('beforeHandler_1'))
          .before(mockHandler('beforeHandler_2'))
          .use(mockHandler('handler_1'))
          .after(mockHandler('afterHandler_1'))
          .after(mockHandler('afterHandler_2'))
          .use(mockHandler('handler_2'));
        await phase.run();
        expect(called).to.eql([
          'beforeHandler_1',
          'beforeHandler_1_done',
          'beforeHandler_2',
          'beforeHandler_2_done',
          'handler_1',
          'handler_1_done',
          'handler_2',
          'handler_2_done',
          'afterHandler_1',
          'afterHandler_1_done',
          'afterHandler_2',
          'afterHandler_2_done',
        ]);
      });
    });
  });

  describe('phase.use(handler)', () => {
    it('should add a handler that is invoked during a phase', async () => {
      const phase = new Phase();
      let invoked = false;
      phase.use(async ctx => {
        invoked = true;
      });
      await phase.run();
      expect(invoked).to.equal(true);
    });
  });

  describe('phase.after(handler)', () => {
    it('should add a handler that is invoked after a phase', async () => {
      const phase = new Phase('test');
      phase
        .use(async ctx => {
          ctx.foo = 'ba';
        })
        .use(async ctx => {
          ctx.foo = ctx.foo + 'r';
        });
      phase.after(async ctx => {
        assert(ctx.foo === 'bar');
      });
      await phase.run();
    });
  });
});
