// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get} from '../..';

describe('re-export controller decorators', () => {
  it('exports functions from @loopback/openapi-v3', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      // Make sure the decorators are exported
      @get('/test')
      async test() {
        return '';
      }
    }
  });
});
