// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as bluebird from 'bluebird';
import {expect} from '@loopback/testlab';
import {isPromise} from '../../src';

describe('isPromise', () => {
  it('returns false for undefined', () => {
    expect(isPromise(undefined)).to.be.false();
  });

  it('returns false for a string value', () => {
    expect(isPromise('string-value')).to.be.false();
  });

  it('returns false for a plain object', () => {
    expect(isPromise({foo: 'bar'})).to.be.false();
  });

  it('returns false for an array', () => {
    expect(isPromise([1, 2, 3])).to.be.false();
  });

  it('returns false for a Date', () => {
    expect(isPromise(new Date())).to.be.false();
  });

  it('returns true for a native Promise', () => {
    expect(isPromise(Promise.resolve())).to.be.true();
  });

  it('returns true for a Bluebird Promise', () => {
    expect(isPromise(bluebird.resolve())).to.be.true();
  });

  it('returns false when .then() is not a function', () => {
    expect(isPromise({ then: 'later' })).to.be.false();
  });
});
