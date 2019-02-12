// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {TimerProvider} from '../../..';
import {TimerFn, HighResTime} from '../../..';

describe('TimerProvider (unit)', () => {
  it('returns current time given no start time', () => {
    const timer: TimerFn = new TimerProvider().value();
    const time: HighResTime = timer();
    expect(time).to.have.lengthOf(2);
    expect(time[0]).to.be.a.Number();
    expect(time[1]).to.be.a.Number();
  });

  it('returns the time difference given a time', () => {
    const timer: TimerFn = new TimerProvider().value();
    const diff: HighResTime = timer([2, 2]);
    expect(diff).to.have.lengthOf(2);
    expect(diff[0]).to.be.a.Number();
    expect(diff[1]).to.be.a.Number();
  });
});
