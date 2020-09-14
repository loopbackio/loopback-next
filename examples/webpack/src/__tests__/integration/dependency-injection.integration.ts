// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-webpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {main} from '../..';
import {assertGreetings} from './test-helper';

describe('dependency injection', () => {
  it('invokes main function', async () => {
    const greetings: string[] = await main();
    // Trim date headers
    assertGreetings(greetings);
  });
});
