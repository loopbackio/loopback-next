// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {LogLevelProvider, LOG_LEVEL} from '../../..';

describe('LogLevelProvider (unit)', () => {
  it('returns LOG_LEVEL.WARN as default level', () => {
    const level = new LogLevelProvider().value();
    expect(level).to.be.eql(LOG_LEVEL.WARN);
  });
});
