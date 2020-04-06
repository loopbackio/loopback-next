// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  InvalidRelationError,
  isInvalidRelationError,
  RelationType,
} from '../../..';

describe('InvalidRelationDefinitionError', () => {
  it('inherits from Error correctly', () => {
    const err = givenAnErrorInstance();
    expect(err).to.be.instanceof(InvalidRelationError);
    expect(err).to.be.instanceof(Error);
    expect(err.stack)
      .to.be.String()
      // NOTE(bajtos) We cannot assert using __filename because stack traces
      // are typically converted from JS paths to TS paths using source maps.
      .and.match(/invalid-relation-error\.test\.(ts|js)/);
  });

  it('sets code to "INVALID_RELATION_DEFINITION"', () => {
    const err = givenAnErrorInstance();
    expect(err.code).to.equal('INVALID_RELATION_DEFINITION');
  });
});

describe('isInvalidRelationError', () => {
  it('returns true for an instance of EntityNotFoundError', () => {
    const error = givenAnErrorInstance();
    expect(isInvalidRelationError(error)).to.be.true();
  });

  it('returns false for an instance of Error', () => {
    const error = new Error('A generic error');
    expect(isInvalidRelationError(error)).to.be.false();
  });
});

function givenAnErrorInstance() {
  class Category extends Entity {}
  class Product extends Entity {}

  return new InvalidRelationError('a reason', {
    name: 'products',
    type: RelationType.hasMany,
    targetsMany: true,
    source: Category,
    target: () => Product,
  });
}
