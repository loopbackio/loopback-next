// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context} from '@loopback/context';
import {Sequence} from '../..';

import {StopWatch, Logger, Tracing, MethodInvoker, HttpServer} from './actions';

describe('Sequence', () => {
  let ctx: Context;

  beforeEach(givenContext);

  it('creates a sequence of actions', async () => {
    ctx.bind('log.level').to('INFO');
    ctx.bind('log.prefix').to('LoopBack');

    const classes = [Logger, StopWatch, HttpServer, MethodInvoker, Tracing];
    const sequence = new Sequence(classes, ctx);

    await sequence.run();

    const logger = await sequence.get('actions.Logger');
    expect(logger.lastMessage).to.match(
      /\[INFO\]\[LoopBack\] TracingId: .+, Duration: \d+/,
    );
  });

  function givenContext() {
    ctx = new Context();
  }
});
