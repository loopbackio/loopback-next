// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  HasManyDefinition,
  ModelDefinition,
  RelationType,
} from '../../..';
import {resolveHasManyMetadata} from '../../../relations/has-many/has-many.helpers';

describe('keyTo and keyFrom with resolveHasManyMetadata', () => {
  it('resolves metadata using keyTo and keyFrom', () => {
    const meta = resolveHasManyMetadata(Category.definition.relations[
      'products'
    ] as HasManyDefinition);

    expect(meta).to.eql({
      name: 'products',
      type: 'hasMany',
      targetsMany: true,
      source: Category,
      keyFrom: 'id',
      target: () => Product,
      keyTo: 'categoryId',
    });
  });

  it('resolves metadata using keyTo, but not keyFrom', () => {
    const meta = resolveHasManyMetadata(Category.definition.relations[
      'items'
    ] as HasManyDefinition);

    expect(meta).to.not.have.property('keyFrom');

    expect(meta).to.eql({
      name: 'items',
      type: 'hasMany',
      targetsMany: true,
      source: Category,
      target: () => Item,
      keyTo: 'categoryId',
    });
  });

  it('infers keyTo if is it not provided', () => {
    const meta = resolveHasManyMetadata(Category.definition.relations[
      'things'
    ] as HasManyDefinition);

    expect(meta).to.eql({
      name: 'things',
      type: 'hasMany',
      targetsMany: true,
      source: Category,
      keyFrom: 'id',
      target: () => Thing,
      keyTo: 'categoryId',
    });
  });

  it('throws if both keyFrom and keyTo are not provided', async () => {
    let error;

    try {
      resolveHasManyMetadata(Category.definition.relations[
        'categories'
      ] as HasManyDefinition);
    } catch (err) {
      error = err;
    }

    expect(error.message).to.eql(
      'Invalid hasMany definition for Category#categories: target model ' +
        'Category is missing definition of foreign key categoryId',
    );

    expect(error.code).to.eql('INVALID_RELATION_DEFINITION');
  });

  /******  HELPERS *******/

  class Category extends Entity {}

  Category.definition = new ModelDefinition('Category')
    .addProperty('id', {type: 'number', id: true, required: true})
    .addRelation(<HasManyDefinition>{
      name: 'products',
      type: RelationType.hasMany,
      targetsMany: true,

      source: Category,
      keyFrom: 'id',

      target: () => Product,
      keyTo: 'categoryId',
    })
    .addRelation(<HasManyDefinition>{
      name: 'items',
      type: RelationType.hasMany,
      targetsMany: true,

      source: Category,
      // no keyFrom

      target: () => Item,
      keyTo: 'categoryId',
    })
    .addRelation(<HasManyDefinition>{
      name: 'things',
      type: RelationType.hasMany,
      targetsMany: true,

      source: Category,
      keyFrom: 'id',

      target: () => Thing,
      // no keyTo
    })
    .addRelation(<HasManyDefinition>{
      name: 'categories',
      type: RelationType.hasMany,
      targetsMany: true,

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
