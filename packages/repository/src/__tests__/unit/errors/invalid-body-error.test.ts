// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {InvalidBodyError, isInvalidBodyError} from '../../..';

describe('InvalidBodyDefinitionError', () => {
  it('inherits from Error correctly', () => {
    const err = givenAnErrorInstance();
    expect(err).to.be.instanceof(InvalidBodyError);
    expect(err).to.be.instanceof(Error);
    expect(err.stack)
      .to.be.String()
      // NOTE(bajtos) We cannot assert using __filename because stack traces
      // are typically converted from JS paths to TS paths using source maps.
      .and.match(/invalid-body-error\.test\.(ts|js)/);
  });

  it('sets code to "INVALID_BODY_DEFINITION"', () => {
    const err = givenAnErrorInstance();
    expect(err.code).to.equal('INVALID_BODY_DEFINITION');
  });
});

describe('isInvalidBodyError', () => {
  it('returns true for an instance of InvalidBodyError', () => {
    const error = givenAnErrorInstance();
    expect(isInvalidBodyError(error)).to.be.true();
  });

  it('returns false for an instance of Error', () => {
    const error = new Error('A generic error');
    expect(isInvalidBodyError(error)).to.be.false();
  });
});

function givenAnErrorInstance() {
  return new InvalidBodyError('a reason', {
    entityOrName: 'products',
    entityId: 1,
  });
}
