// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Provider, Context} from '../../src';

describe('Provider', () => {
  let provider: Provider;

  beforeEach(givenProvider);

  describe('value()', () => {
    it('returns the value of the binding', () => {
      const ctx: Context = new Context();
      expect(provider.value(ctx)).to.equal('hello world');
    });
  });

  function givenProvider() {
    provider = new MyProvider('hello');
  }
});

class MyProvider implements Provider {
  constructor(private _msg: string) {}
  value(ctx: Context): string {
    return this._msg + ' world';
  }
}
