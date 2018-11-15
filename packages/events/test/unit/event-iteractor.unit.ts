// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {createAsyncEventIterator} from '../..';
import {EventEmitter} from 'events';

describe('async event iterator', () => {
  let eventEmitter: EventEmitter;
  let timer: NodeJS.Timer;

  it('pulls in events until done', async () => {
    const asyncEventIterator = givenAsyncEventIterator(false);
    let count = 0;
    // tslint:disable-next-line:await-promise
    for await (const e of asyncEventIterator) {
      count++;
      expect(e).to.eql({count});
    }
    expect(count).to.eql(10);
  });

  it('pulls in events until error', async () => {
    async function run() {
      const asyncEventIterator = givenAsyncEventIterator(true);
      let count = 0;
      // tslint:disable-next-line:await-promise
      for await (const e of asyncEventIterator) {
        count++;
        expect(e).to.eql({count});
      }
    }
    return expect(run())
      .to.be.rejectedWith('count >= 10')
      .catch(e => {});
  });

  function givenAsyncEventIterator(error: boolean) {
    eventEmitter = new EventEmitter();
    let count = 0;
    timer = setInterval(() => {
      eventEmitter.emit('click', {count: ++count});
      if (count >= 10) {
        clearInterval(timer);
        if (error) {
          eventEmitter.emit('error', 'count >= 10');
        } else {
          eventEmitter.emit('done', {count});
        }
      }
    }, 10);
    return createAsyncEventIterator<{count: number}>(eventEmitter, 'click', {
      rejectionEvents: ['error'],
      resolutionEvents: ['done'],
    });
  }
});
