// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {BindingProvider, Context} from '../../src';

describe('BindingProvider', () => {
  let provider: BindingProvider<String>;

  beforeEach(givenProvider);

  describe('source()', () => {
    it('returns the source of the binding', () => {
      expect(provider.source()).to.equal('hello');
    });
  });

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

class MyProvider extends BindingProvider<string> {
  constructor(private _msg: string) {
    super();
  }
  source(): string {
    return this._msg;
  }
  value(ctx: Context): string {
    return this.source() + ' world';
  }
}
