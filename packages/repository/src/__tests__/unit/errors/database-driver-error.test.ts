// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {DatabaseDriverError, isDatabaseDriverError} from '../../..';

describe('DatabaseDriverError', () => {
  it('inherits from Error correctly', () => {
    const err = givenAnErrorInstance();
    expect(err).to.be.instanceof(DatabaseDriverError);
    expect(err).to.be.instanceof(Error);
    expect(err.stack)
      .to.be.String()
      // NOTE(bajtos) We cannot assert using __filename because stack traces
      // are typically converted from JS paths to TS paths using source maps.
      .and.match(/database-driver-error\.test\.(ts|js)/);
  });

  it('sets code to "DB_FOREIGN_KEY_VIOLATION"', () => {
    const err = givenAnErrorInstance();
    expect(err.code).to.equal('DB_FOREIGN_KEY_VIOLATION');
  });

  it('sets statusCode to 422', () => {
    const err = givenAnErrorInstance();
    expect(err.statusCode).to.equal(422);
  });

  it('sets nativeCode to "1216"', () => {
    const err = givenAnErrorInstance();
    expect(err.nativeCode).to.equal('1216'); // mysql's native code for foreign key violation
  });
});

describe('isDatabaseDriverError', () => {
  it('returns true for an instance of DatabaseDriverError', () => {
    const error = givenAnErrorInstance();
    expect(isDatabaseDriverError(error)).to.be.true();
  });

  it('returns false for an instance of Error', () => {
    const error = new Error('A generic error');
    expect(isDatabaseDriverError(error)).to.be.false();
  });
});

function givenAnErrorInstance() {
  return new DatabaseDriverError('User', '', {
    code: 'DB_FOREIGN_KEY_VIOLATION',
    statusCode: 422,
    nativeCode: '1216', // mysql's native code for foreign key violation
  });
}
