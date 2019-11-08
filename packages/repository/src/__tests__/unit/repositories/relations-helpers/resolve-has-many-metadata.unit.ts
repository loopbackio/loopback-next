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
} from '../../../..';
import {resolveHasManyMetadata} from '../../../../relations/has-many/has-many.helpers';

describe('resolveHasManyMetadata', () => {
  it('throws if the wrong metadata type is used', async () => {
    const metadata: unknown = {
      name: 'category',
      type: RelationType.hasOne,
      targetsMany: false,
      source: Category,
      target: () => Category,
    };

    expect(() => {
      resolveHasManyMetadata(metadata as HasManyDefinition);
    }).to.throw(
      /Invalid hasOne definition for Category#category: relation type must be HasMany/,
    );
  });

  describe('keyTo and keyFrom with resolveHasManyMetadata', () => {
    it('resolves metadata using keyTo and keyFrom', () => {
      const metadata = {
        name: 'products',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        keyFrom: 'id',

        target: () => Product,
        keyTo: 'categoryId',
      };
      const meta = resolveHasManyMetadata(metadata as HasManyDefinition);

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

    it('infers keyFrom if it is not provided', () => {
      const metadata = {
        name: 'products',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        // no keyFrom

        target: () => Product,
        keyTo: 'categoryId',
      };
      const meta = resolveHasManyMetadata(metadata as HasManyDefinition);

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

    it('infers keyTo if it is not provided', () => {
      const metadata = {
        name: 'products',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        keyFrom: 'id',

        target: () => Product,
        // no keyTo
      };

      const meta = resolveHasManyMetadata(metadata as HasManyDefinition);

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

    it('throws if keyFrom, keyTo, and default foreign key name are not provided', async () => {
      const metadata = {
        name: 'categories',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        // no keyFrom

        target: () => Category,
        // no keyTo
      };

      expect(() => {
        resolveHasManyMetadata(metadata as HasManyDefinition);
      }).to.throw(
        /Invalid hasMany definition for Category#categories: target model Category is missing definition of foreign key categoryId/,
      );
    });

    it('resolves metadata if keyTo and keyFrom are not provided, but default foreign key is', async () => {
      Category.definition.addProperty('categoryId', {type: 'number'});

      const metadata = {
        name: 'category',
        type: RelationType.hasMany,
        targetsMany: true,

        source: Category,
        // no keyFrom

        target: () => Category,
        // no keyTo
      };

      const meta = resolveHasManyMetadata(metadata as HasManyDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasMany',
        targetsMany: true,
        source: Category,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'categoryId',
      });
    });
  });
  /******  HELPERS *******/

  class Category extends Entity {}

  Category.definition = new ModelDefinition('Category').addProperty('id', {
    type: 'number',
    id: true,
    required: true,
  });

  class Product extends Entity {}

  Product.definition = new ModelDefinition('Product')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    .addProperty('categoryId', {type: 'number'});
});
