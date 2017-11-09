// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {ActionPubSub, Sequence, ActionMethod} from '../..';

import {StopWatch, Logger, Tracing, MethodInvoker, HttpServer} from './actions';

describe('ActionPubSub', () => {
  let sequence: Sequence;
  let logMethod: ActionMethod;
  let startMethod: ActionMethod;
  let pubsub: ActionPubSub;

  beforeEach(givenActionPubSub);

  it('subscribes to a new topic', () => {
    pubsub.subscribe('invocation.finished', logMethod);
    expect(pubsub.topics()).to.eql(['invocation.finished']);
    expect(pubsub.subscribedTopics(logMethod)).to.eql(['invocation.finished']);
  });

  it('subscribes to two topics', () => {
    pubsub.subscribe('invocation.finished', logMethod);
    pubsub.subscribe('invocation.failed', logMethod);
    pubsub.subscribe('http.request.started', startMethod);
    expect(pubsub.topics()).to.eql([
      'invocation.finished',
      'invocation.failed',
      'http.request.started',
    ]);
    expect(pubsub.subscribedTopics(logMethod)).to.eql([
      'invocation.finished',
      'invocation.failed',
    ]);
    expect(pubsub.subscribersOf('invocation.finished')).to.eql([logMethod]);
  });

  it('unsubscribes from topics', () => {
    pubsub.subscribe('invocation.finished', logMethod);
    pubsub.subscribe('invocation.failed', logMethod);
    let found = pubsub.unsubscribe('invocation.failed', logMethod);
    expect(found).to.be.true();
    found = pubsub.unsubscribe('invocation.failed', startMethod);
    expect(found).to.be.false();
    expect(pubsub.subscribedTopics(logMethod)).to.eql(['invocation.finished']);
  });

  it('unsubscribes by topic', () => {
    pubsub.subscribe('invocation.finished', logMethod);
    pubsub.subscribe('invocation.failed', logMethod);
    let subscribers = pubsub.unsubscribeTopic('invocation.failed');
    expect(subscribers).to.eql([logMethod]);
    expect(pubsub.subscribedTopics(logMethod)).to.eql(['invocation.finished']);
  });

  it('unsubscribes all', () => {
    pubsub.subscribe('invocation.finished', logMethod);
    pubsub.subscribe('invocation.failed', logMethod);
    let subscribers = pubsub.unsubscribeAll(logMethod);
    expect(subscribers).to.eql(['invocation.finished', 'invocation.failed']);
    expect(pubsub.subscribedTopics(logMethod)).to.eql([]);
  });

  it('resets', () => {
    pubsub.subscribe('invocation.finished', logMethod);
    pubsub.subscribe('invocation.failed', logMethod);
    pubsub.reset();
    expect(pubsub.topics()).to.eql([]);
    expect(pubsub.subscribedTopics(logMethod)).to.eql([]);
  });

  it('publishes to a topic', async () => {
    pubsub.context.bind('log.prefix').to('LoopBack');
    pubsub.context.bind('log.level').to('INFO');
    pubsub.context.bind('tracingId').to('dummy-tracing-id');
    pubsub.context.bind('duration').to(10);

    pubsub.subscribe('invocation.finished', logMethod);
    pubsub.subscribe('invocation.failed', logMethod);
    await pubsub.publish('invocation.finished', {});
  });

  function givenActionPubSub() {
    const classes = [Logger, StopWatch, HttpServer, MethodInvoker, Tracing];
    sequence = new Sequence(classes);
    pubsub = new ActionPubSub(sequence);
    logMethod = sequence.actionGraph.getMethods()[
      'method:Logger.prototype.log'
    ];
    startMethod = sequence.actionGraph.getMethods()[
      'method:StopWatch.prototype.start'
    ];
  }
});
