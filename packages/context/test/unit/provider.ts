// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Provider, Context, Binding} from '../../src';

describe('Provider', () => {
  let provider: Provider<String>;

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

class MyProvider implements Provider<String> {
  constructor(private _msg: string) {}
  value(): String {
    return this._msg + ' world';
  }
}
