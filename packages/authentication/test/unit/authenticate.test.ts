// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {authenticate, getAuthenticateMetadata} from '../../src/authenticate';

describe('@authenticate decorator', () => {
  it('can add authenticate metadata to target method', () => {
    class TestClass {
     constructor() {}

     @authenticate
     async whoAmI() {
      return;
     }
   }

    const test: TestClass = new TestClass();
    const metaData = getAuthenticateMetadata(test, 'whoAmI');
    expect(metaData).to.deepEqual(true);
  });
});
