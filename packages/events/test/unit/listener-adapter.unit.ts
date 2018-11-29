// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {asListener} from '../..';
import {ListenerObject, listen} from '../..';

describe('listener adapter', () => {
  it('adapts an object with matching methods', async () => {
    const events: string[] = [];
    class MyListener {
      start() {
        events.push('start');
      }

      stop() {
        events.push('stop');
      }
    }
    const inst = new MyListener();
    await asListener(inst)('', 'start');
    expect(events).to.eql(['start']);
    await asListener(inst)('', 'stop');
    expect(events).to.eql(['start', 'stop']);
  });

  it('adapts an object with listen()', async () => {
    const events: string[] = [];
    class MyListener implements ListenerObject<string> {
      async listen(event: string, eventName: string) {
        events.push(eventName);
      }
    }
    const inst = new MyListener();
    await asListener(inst)('', 'start');
    expect(events).to.eql(['start']);
    await asListener(inst)('', 'stop');
    expect(events).to.eql(['start', 'stop']);
  });

  it('adapts an object with @listen()', async () => {
    const events: string[] = [];
    class MyListener {
      @listen('start')
      _start() {
        events.push('start');
      }

      @listen(/stop/)
      _stop() {
        events.push('stop');
      }
    }
    const inst = new MyListener();
    await asListener(inst)('', 'start');
    expect(events).to.eql(['start']);
    await asListener(inst)('', 'stop');
    expect(events).to.eql(['start', 'stop']);
  });
});
