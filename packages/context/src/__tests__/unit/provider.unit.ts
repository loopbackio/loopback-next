// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Provider} from '../../';

describe('Provider', () => {
  let provider: Provider<string>;

  beforeEach(givenProvider);

  describe('value()', () => {
    it('returns the value of the binding', () => {
      expect(provider.value()).to.equal('hello world');
    });
  });

  function givenProvider() {
    provider = new MyProvider('hello');
  }
});

class MyProvider implements Provider<string> {
  constructor(private _msg: string) {}
  value(): string {
    return this._msg + ' world';
  }
}
