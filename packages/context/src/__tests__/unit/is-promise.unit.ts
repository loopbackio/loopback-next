// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as bluebird from 'bluebird';
import {expect} from '@loopback/testlab';
import {isPromiseLike} from '../..';

describe('isPromise', () => {
  it('returns false for undefined', () => {
    expect(isPromiseLike(undefined)).to.be.false();
  });

  it('returns false for a string value', () => {
    expect(isPromiseLike('string-value')).to.be.false();
  });

  it('returns false for a plain object', () => {
    expect(isPromiseLike({foo: 'bar'})).to.be.false();
  });

  it('returns false for an array', () => {
    expect(isPromiseLike([1, 2, 3])).to.be.false();
  });

  it('returns false for a Date', () => {
    expect(isPromiseLike(new Date())).to.be.false();
  });

  it('returns true for a native Promise', () => {
    expect(isPromiseLike(Promise.resolve())).to.be.true();
  });

  it('returns true for a Bluebird Promise', () => {
    expect(isPromiseLike(bluebird.resolve())).to.be.true();
  });

  it('returns false when .then() is not a function', () => {
    expect(isPromiseLike({then: 'later'})).to.be.false();
  });
});
