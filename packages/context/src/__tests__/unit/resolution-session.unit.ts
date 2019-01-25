// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {ResolutionSession, Binding, Injection, inject} from '../..';

describe('ResolutionSession', () => {
  class MyController {
    // tslint:disable-next-line:no-unused
    constructor(@inject('b') private b: string) {}
  }
  function givenInjection(): Injection {
    return {
      target: MyController,
      bindingSelector: 'b',
      methodDescriptorOrParameterIndex: 0,
    };
  }

  let session: ResolutionSession;

  beforeEach(() => {
    session = new ResolutionSession();
  });

  it('tracks bindings', () => {
    const binding = new Binding('a');
    session.pushBinding(binding);
    expect(session.currentBinding).to.be.exactly(binding);
    expect(session.bindingStack).to.eql([binding]);
    expect(session.popBinding()).to.be.exactly(binding);
  });

  it('tracks injections', () => {
    const injection: Injection = givenInjection();
    session.pushInjection(injection);
    expect(session.currentInjection).to.be.exactly(injection);
    expect(session.injectionStack).to.eql([injection]);
    expect(session.popInjection()).to.be.exactly(injection);
  });

  it('popBinding() reports error if the top element is not a binding', () => {
    const injection: Injection = givenInjection();
    session.pushInjection(injection);
    expect(session.currentBinding).to.be.undefined();
    expect(() => session.popBinding()).to.throw(
      /The top element must be a binding/,
    );
  });

  it('popInjection() reports error if the top element is not an injection', () => {
    const binding = new Binding('a');
    session.pushBinding(binding);
    expect(session.currentInjection).to.be.undefined();
    expect(() => session.popInjection()).to.throw(
      /The top element must be an injection/,
    );
  });

  it('tracks mixed bindings and injections', () => {
    const bindingA = new Binding('a');
    session.pushBinding(bindingA);
    const injection: Injection = givenInjection();
    session.pushInjection(injection);
    const bindingB = new Binding('b');
    session.pushBinding(bindingB);

    expect(session.currentBinding).to.be.exactly(bindingB);
    expect(session.bindingStack).to.eql([bindingA, bindingB]);

    expect(session.currentInjection).to.be.exactly(injection);
    expect(session.injectionStack).to.eql([injection]);
    expect(session.getBindingPath()).to.eql('a --> b');
    expect(session.getInjectionPath()).to.eql('MyController.constructor[0]');
    expect(session.getResolutionPath()).to.eql(
      'a --> @MyController.constructor[0] --> b',
    );

    expect(session.popBinding()).to.be.exactly(bindingB);
    expect(session.popInjection()).to.be.exactly(injection);
    expect(session.popBinding()).to.be.exactly(bindingA);
  });

  describe('fork()', () => {
    it('returns undefined if the current session does not exist', () => {
      expect(ResolutionSession.fork(undefined)).to.be.undefined();
    });

    it('creates a new session with the same state as the current one', () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      session1.pushInjection(injection);
      const bindingB = new Binding('b');
      session1.pushBinding(bindingB);
      const session2: ResolutionSession = ResolutionSession.fork(session1)!;
      expect(session1).not.to.be.exactly(session2);
      expect(session1.stack).not.to.be.exactly(session2.stack);
      expect(session1.stack).to.be.eql(session2.stack);
      const bindingC = new Binding('c');
      session2.pushBinding(bindingC);
      expect(session2.currentBinding).to.be.exactly(bindingC);
      expect(session1.currentBinding).to.be.exactly(bindingB);
    });
  });

  describe('runWithBinding()', () => {
    it('allows current session to be undefined', () => {
      const bindingA = new Binding('a');
      const val = ResolutionSession.runWithBinding(() => 'ok', bindingA);
      expect(val).to.eql('ok');
    });

    it('allows a promise to be returned', async () => {
      const bindingA = new Binding('a');
      const val = await ResolutionSession.runWithBinding(
        () => Promise.resolve('ok'),
        bindingA,
      );
      expect(val).to.eql('ok');
    });

    it('pushes/pops the binding atomically for a sync action', () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      session1.pushInjection(injection);
      const bindingB = new Binding('b');
      const val = ResolutionSession.runWithBinding(
        () => 'ok',
        bindingB,
        session1,
      );
      expect(val).to.eql('ok');
      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([injection]);
    });

    it('pushes/pops the binding atomically for a failed sync action', () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      session1.pushInjection(injection);
      const bindingB = new Binding('b');
      expect(() => {
        ResolutionSession.runWithBinding(
          () => {
            throw new Error('bad');
          },
          bindingB,
          session1,
        );
      }).to.throw('bad');

      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([injection]);
    });

    it('pushes/pops the binding atomically for an async action', async () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      session1.pushInjection(injection);
      const bindingB = new Binding('b');
      const val = await ResolutionSession.runWithBinding(
        () => Promise.resolve('ok'),
        bindingB,
        session1,
      );
      expect(val).to.eql('ok');
      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([injection]);
    });

    it('pushes/pops the binding atomically for a failed action', async () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      session1.pushInjection(injection);
      const bindingB = new Binding('b');
      const val = ResolutionSession.runWithBinding(
        () => Promise.reject(new Error('bad')),
        bindingB,
        session1,
      );
      await expect(val).to.rejectedWith('bad');
      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([injection]);
    });
  });

  describe('runWithInjection()', () => {
    it('allows current session to be undefined', () => {
      const injection = givenInjection();
      const val = ResolutionSession.runWithInjection(() => 'ok', injection);
      expect(val).to.eql('ok');
    });

    it('allows a promise to be returned', async () => {
      const injection = givenInjection();
      const val = await ResolutionSession.runWithInjection(
        () => Promise.resolve('ok'),
        injection,
      );
      expect(val).to.eql('ok');
    });

    it('pushes/pops the injection atomically for a sync action', () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      const val = ResolutionSession.runWithInjection(
        () => 'ok',
        injection,
        session1,
      );
      expect(val).to.eql('ok');
      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([]);
    });

    it('pushes/pops the injection atomically for a failed sync action', () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      expect(() => {
        ResolutionSession.runWithInjection(
          () => {
            throw new Error('bad');
          },
          injection,
          session1,
        );
      }).to.throw('bad');

      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([]);
    });

    it('pushes/pops the injection atomically for an async action', async () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      const val = await ResolutionSession.runWithInjection(
        () => Promise.resolve('ok'),
        injection,
        session1,
      );
      expect(val).to.eql('ok');
      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([]);
    });

    it('pushes/pops the injection atomically for a failed async action', async () => {
      const session1 = new ResolutionSession();
      const bindingA = new Binding('a');
      session1.pushBinding(bindingA);
      const injection: Injection = givenInjection();
      const val = ResolutionSession.runWithInjection(
        () => Promise.reject(new Error('bad')),
        injection,
        session1,
      );
      await expect(val).to.rejectedWith('bad');
      expect(session1.bindingStack).to.be.eql([bindingA]);
      expect(session1.injectionStack).to.be.eql([]);
    });
  });
});
