// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

describe('bindings.get.basic-usage', () => {
  let ctx;
  before('given an empty context (binding container)', getContext);
  before('and a simple value `bar` bound to the key', setBinding);

  context('when I resolve the binding for `foo`', () => {
    it('returns the bound value `bar`', () => {
      const result = ctx.get('foo');
      expect(result).to.equal('bar');
    });
  });

  function getContext() {
    ctx = util.getContext();
  }
  function setBinding() {
    ctx.bind('foo').to('bar');
  }
});
