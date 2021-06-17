// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {tryCatchFinally, tryWithFinally} from '../..';

describe('tryWithFinally', () => {
  it('performs final action for a fulfilled promise', async () => {
    let finalActionInvoked = false;
    const action = () => Promise.resolve(1);
    const finalAction = () => (finalActionInvoked = true);
    await tryWithFinally(action, finalAction);
    expect(finalActionInvoked).to.be.true();
  });

  it('performs final action for a resolved value', () => {
    let finalActionInvoked = false;
    const action = () => 1;
    const finalAction = () => (finalActionInvoked = true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tryWithFinally(action, finalAction);
    expect(finalActionInvoked).to.be.true();
  });

  it('performs final action for a rejected promise', async () => {
    let finalActionInvoked = false;
    const action = () => Promise.reject(new Error('error'));
    const finalAction = () => (finalActionInvoked = true);
    await expect(tryWithFinally(action, finalAction)).be.rejectedWith('error');
    expect(finalActionInvoked).to.be.true();
  });

  it('performs final action for an action that throws an error', () => {
    let finalActionInvoked = false;
    const action = () => {
      throw new Error('error');
    };
    const finalAction = () => (finalActionInvoked = true);
    expect(() => tryWithFinally(action, finalAction)).to.throw('error');
    expect(finalActionInvoked).to.be.true();
  });
});

describe('tryCatchFinally', () => {
  it('performs final action for a fulfilled promise', async () => {
    let finalActionInvoked = false;
    const action = () => Promise.resolve(1);
    const finalAction = () => (finalActionInvoked = true);
    await tryCatchFinally(action, undefined, finalAction);
    expect(finalActionInvoked).to.be.true();
  });

  it('performs final action for a resolved value', () => {
    let finalActionInvoked = false;
    const action = () => 1;
    const finalAction = () => (finalActionInvoked = true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tryCatchFinally(action, undefined, finalAction);
    expect(finalActionInvoked).to.be.true();
  });

  it('skips error action for a fulfilled promise', async () => {
    let errorActionInvoked = false;
    const action = () => Promise.resolve(1);
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      throw err;
    };
    await tryCatchFinally(action, errorAction);
    expect(errorActionInvoked).to.be.false();
  });

  it('skips error action for a resolved value', () => {
    let errorActionInvoked = false;
    const action = () => 1;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      throw err;
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tryCatchFinally(action, errorAction);
    expect(errorActionInvoked).to.be.false();
  });

  it('performs error action for a rejected promise', async () => {
    let errorActionInvoked = false;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      throw err;
    };
    const action = () => Promise.reject(new Error('error'));
    const finalAction = () => true;
    await expect(
      tryCatchFinally(action, errorAction, finalAction),
    ).be.rejectedWith('error');
    expect(errorActionInvoked).to.be.true();
  });

  it('performs error action for an action that throws an error', () => {
    let errorActionInvoked = false;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      throw err;
    };
    const action = () => {
      throw new Error('error');
    };
    const finalAction = () => true;
    expect(() => tryCatchFinally(action, errorAction, finalAction)).to.throw(
      'error',
    );
    expect(errorActionInvoked).to.be.true();
  });

  it('allows error action to return a value for a rejected promise', async () => {
    let errorActionInvoked = false;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      return 1;
    };
    const action = () => Promise.reject(new Error('error'));
    const result = await tryCatchFinally(action, errorAction);
    expect(errorActionInvoked).to.be.true();
    expect(result).to.equal(1);
  });

  it('allows error action to return a value for an action that throws an error', () => {
    let errorActionInvoked = false;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      return 1;
    };
    const action = () => {
      throw new Error('error');
    };
    const result = tryCatchFinally(action, errorAction);
    expect(result).to.equal(1);
    expect(errorActionInvoked).to.be.true();
  });

  it('skips error action for rejection from the final action', async () => {
    let errorActionInvoked = false;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      throw err;
    };
    const action = () => Promise.resolve(1);
    const finalAction = () => {
      throw new Error('error');
    };
    await expect(
      tryCatchFinally(action, errorAction, finalAction),
    ).be.rejectedWith('error');
    expect(errorActionInvoked).to.be.false();
  });

  it('skips error action for error from the final action', () => {
    let errorActionInvoked = false;
    const errorAction = (err: unknown) => {
      errorActionInvoked = true;
      throw err;
    };
    const action = () => 1;
    const finalAction = () => {
      throw new Error('error');
    };
    expect(() => tryCatchFinally(action, errorAction, finalAction)).to.throw(
      'error',
    );
    expect(errorActionInvoked).to.be.false();
  });

  it('allows default error action', () => {
    const action = () => {
      throw new Error('error');
    };
    expect(() => tryCatchFinally(action)).to.throw('error');
  });

  it('allows default error action for rejected promise', () => {
    const action = () => {
      return Promise.reject(new Error('error'));
    };
    return expect(tryCatchFinally(action)).to.be.rejectedWith('error');
  });
});
