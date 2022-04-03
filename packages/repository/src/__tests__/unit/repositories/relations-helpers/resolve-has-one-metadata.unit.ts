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
} from '../../../..';
import {resolveHasOneMetadata} from '../../../../relations/has-one/has-one.helpers';

describe('resolveHasOneMetadata', () => {
  it('throws if the wrong metadata type is used', async () => {
    const metadata: unknown = {
      name: 'category',
      type: RelationType.hasMany,
      targetsMany: true,
      source: Product,
      target: () => Category,
    };

    expect(() => {
      resolveHasOneMetadata(metadata as HasOneDefinition);
    }).to.throw(
      /Invalid hasMany definition for Product#category: relation type must be HasOne/,
    );
  });

  describe('keyTo and keyFrom with resolveHasOneMetadata', () => {
    it('resolves metadata using keyTo and keyFrom', () => {
      const metadata = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,

        source: Product,
        keyFrom: 'id',

        target: () => Category,
        keyTo: 'productId',
      };
      const meta = resolveHasOneMetadata(metadata as HasOneDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasOne',
        targetsMany: false,
        source: Product,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'productId',
        polymorphic: false,
      });
    });

    it('resolves metadata using polymorphic', () => {
      const metadata = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,

        source: Product,
        keyFrom: 'id',

        target: () => Category,
        keyTo: 'productId',

        polymorphic: {discriminator: 'productType'},
      };
      const meta = resolveHasOneMetadata(metadata as HasOneDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasOne',
        targetsMany: false,
        source: Product,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'productId',
        polymorphic: {discriminator: 'productType'},
      });
    });

    it('infers keyFrom if it is not provided', () => {
      const metadata = {
        name: 'category',
        type: 'hasOne',
        targetsMany: false,

        source: Product,
        // no keyFrom

        target: () => Category,
        keyTo: 'productId',
      };
      const meta = resolveHasOneMetadata(metadata as HasOneDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasOne',
        targetsMany: false,
        source: Product,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'productId',
        polymorphic: false,
      });
    });

    it('infers keyTo if it is not provided', () => {
      const metadata = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,

        source: Product,
        keyFrom: 'id',

        target: () => Category,
        // no keyTo
      };

      const meta = resolveHasOneMetadata(metadata as HasOneDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasOne',
        targetsMany: false,
        source: Product,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'productId',
        polymorphic: false,
      });
    });

    it('throws if keyFrom, keyTo, and default foreign key name are not provided', async () => {
      const metadata = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,

        source: Category,
        // no keyFrom

        target: () => Category,
        // no keyTo
      };

      expect(() => {
        resolveHasOneMetadata(metadata as HasOneDefinition);
      }).to.throw(
        /Invalid hasOne definition for Category#category: target model Category is missing definition of foreign key categoryId/,
      );
    });

    it('resolves metadata if keyTo and keyFrom are not provided, but default foreign key is', async () => {
      Category.definition.addProperty('categoryId', {type: 'number'});

      const metadata = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,

        source: Category,
        // no keyFrom

        target: () => Category,
        // no keyTo
      };

      const meta = resolveHasOneMetadata(metadata as HasOneDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasOne',
        targetsMany: false,
        source: Category,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'categoryId',
        polymorphic: false,
      });
    });

    it('infers polymorphic discriminator not provided', async () => {
      Category.definition.addProperty('categoryId', {type: 'number'});

      const metadata = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,

        source: Category,
        // no keyFrom

        target: () => Category,
        // no keyTo

        polymorphic: true,
        // no discriminator
      };

      const meta = resolveHasOneMetadata(metadata as HasOneDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: 'hasOne',
        targetsMany: false,
        source: Category,
        keyFrom: 'id',
        target: () => Category,
        keyTo: 'categoryId',
        polymorphic: {discriminator: 'categoryType'},
      });
    });
  });

  /******  HELPERS *******/

  class Category extends Entity {}

  Category.definition = new ModelDefinition('Category')
    .addProperty('id', {type: 'number', id: true, required: true})
    .addProperty('productId', {type: 'number', required: true});

  class Product extends Entity {}

  Product.definition = new ModelDefinition('Product').addProperty('id', {
    type: 'number',
    id: true,
    required: true,
  });
});
