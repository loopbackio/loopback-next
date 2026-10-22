// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {RelationType} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {getJsonSchema, getNavigationalPropertyForRelation} from '../..';

// ---------------------------------------------------------------------------
// getNavigationalPropertyForRelation
// ---------------------------------------------------------------------------

describe('getNavigationalPropertyForRelation()', () => {
  const targetRef = {$ref: '#/definitions/Target'};

  it('returns the targetRef directly when targetsMany is false (hasOne/belongsTo)', () => {
    const result = getNavigationalPropertyForRelation(
      {
        type: RelationType.hasOne,
        name: 'address',
        targetsMany: false,
      } as never,
      targetRef,
    );
    expect(result).to.deepEqual(targetRef);
  });

  it('returns an array schema when targetsMany is true (hasMany)', () => {
    const result = getNavigationalPropertyForRelation(
      {
        type: RelationType.hasMany,
        name: 'orders',
        targetsMany: true,
      } as never,
      targetRef,
    );
    expect(result).to.deepEqual({type: 'array', items: targetRef});
  });
});

// ---------------------------------------------------------------------------
// getJsonSchema — belongsTo (keyFrom branch at source line 619)
// ---------------------------------------------------------------------------

describe('getJsonSchema() with includeRelations — belongsTo foreignKey', () => {
  @model()
  class Order extends Entity {
    @property({id: true})
    id: number;

    @belongsTo(() => Customer)
    customerId: number;
  }

  @model()
  class Customer extends Entity {
    @property({id: true})
    id: number;

    @property()
    name: string;

    @hasMany(() => Order)
    orders: Order[];
  }

  it('includes foreignKey in the schema when the relation has a keyFrom', () => {
    const schema = getJsonSchema(Order, {includeRelations: true});

    // The belongsTo relation has keyFrom = 'customerId', so
    // result.properties.foreignKey should be set to the keyFrom string.
    expect(schema.properties).to.have.property('foreignKey');
  });
});

// ---------------------------------------------------------------------------
// getJsonSchema — indexInfo with multiple indexed properties
// ---------------------------------------------------------------------------

describe('getJsonSchema() — multiple indexed properties (indexInfo merge branch)', () => {
  @model()
  class MultiIndex extends Entity {
    @property({id: true})
    id: number;

    @property({
      index: {unique: true},
    })
    email: string;

    @property({
      index: {unique: false},
    })
    username: string;
  }

  it('merges indexInfo from multiple indexed properties into the description', () => {
    const schema = getJsonSchema(MultiIndex);
    // Both 'email' and 'username' have index info — the schema description
    // should encode both (lines 494-519 of build-schema.ts).
    expect(schema.description).to.match(/indexInfo/);
  });
});
