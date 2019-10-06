// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  HasOneDefinition,
  ModelDefinition,
  RelationType,
} from '../../..';
import {resolveHasOneMetadata} from '../../../relations/has-one/has-one.helpers';

describe('keyTo and keyFrom with resolveHasOneMetadata', () => {
  it('resolves metadata using keyTo and keyFrom', () => {
    const meta = resolveHasOneMetadata(Category.definition.relations[
      'product'
    ] as HasOneDefinition);

    expect(meta).to.eql({
      name: 'product',
      type: 'hasOne',
      targetsMany: false,
      source: Category,
      keyFrom: 'id',
      target: () => Product,
      keyTo: 'categoryId',
    });
  });

  it('infers keyFrom if it is not provided', () => {
    const meta = resolveHasOneMetadata(Category.definition.relations[
      'item'
    ] as HasOneDefinition);

    expect(meta).to.eql({
      name: 'item',
      type: 'hasOne',
      targetsMany: false,
      source: Category,
      keyFrom: 'id',
      target: () => Item,
      keyTo: 'categoryId',
    });
  });

  it('infers keyTo if it is not provided', () => {
    const meta = resolveHasOneMetadata(Category.definition.relations[
      'thing'
    ] as HasOneDefinition);

    expect(meta).to.eql({
      name: 'thing',
      type: 'hasOne',
      targetsMany: false,
      source: Category,
      keyFrom: 'id',
      target: () => Thing,
      keyTo: 'categoryId',
    });
  });

  it('throws if keyFrom, keyTo, and default foreign key name are not provided', async () => {
    let error;

    try {
      resolveHasOneMetadata(Category.definition.relations[
        'category'
      ] as HasOneDefinition);
    } catch (err) {
      error = err;
    }

    expect(error.message).to.eql(
      'Invalid hasOne definition for Category#category: target model Category' +
        ' is missing definition of foreign key categoryId',
    );

    expect(error.code).to.eql('INVALID_RELATION_DEFINITION');
  });

  it('resolves metadata if keyTo and keyFrom are not provided, but default foreign key is', async () => {
    Category.definition.addProperty('categoryId', {type: 'number'});

    const meta = resolveHasOneMetadata(Category.definition.relations[
      'category'
    ] as HasOneDefinition);

    expect(meta).to.eql({
      name: 'category',
      type: 'hasOne',
      targetsMany: false,
      source: Category,
      keyFrom: 'id',
      target: () => Category,
      keyTo: 'categoryId',
    });
  });

  /******  HELPERS *******/

  class Category extends Entity {}

  Category.definition = new ModelDefinition('Category')
    .addProperty('id', {type: 'number', id: true, required: true})
    .addRelation(<HasOneDefinition>{
      name: 'product',
      type: RelationType.hasOne,
      targetsMany: false,

      source: Category,
      keyFrom: 'id',

      target: () => Product,
      keyTo: 'categoryId',
    })
    .addRelation(<HasOneDefinition>{
      name: 'item',
      type: RelationType.hasOne,
      targetsMany: false,

      source: Category,
      // no keyFrom

      target: () => Item,
      keyTo: 'categoryId',
    })
    .addRelation(<HasOneDefinition>{
      name: 'thing',
      type: RelationType.hasOne,
      targetsMany: false,

      source: Category,
      keyFrom: 'id',

      target: () => Thing,
      // no keyTo
    })
    .addRelation(<HasOneDefinition>{
      name: 'category',
      type: RelationType.hasOne,
      targetsMany: false,

      source: Category,
      // no keyFrom

      target: () => Category,
      // no keyTo
    });

  class Product extends Entity {}

  Product.definition = new ModelDefinition('Product')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    .addProperty('categoryId', {type: 'number'});

  class Item extends Entity {}

  Item.definition = new ModelDefinition('Item')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    .addProperty('categoryId', {type: 'number'});

  class Thing extends Entity {}

  Thing.definition = new ModelDefinition('Thing')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    .addProperty('categoryId', {type: 'number'});
});
