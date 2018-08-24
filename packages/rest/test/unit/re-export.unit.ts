// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {disableUnusedLocalError} from '@loopback/testlab';
import {get} from '../..';

describe('re-export controller decorators', () => {
  it('exports functions from @loopback/openapi-v3', async () => {
    class Test {
      // Make sure the decorators are exported
      @get('/test')
      async test() {
        return '';
      }
    }
    disableUnusedLocalError(Test);
  });
});
