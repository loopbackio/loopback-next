// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  BelongsToDefinition,
  Entity,
  ModelDefinition,
  RelationType,
} from '../../../..';
import {resolveBelongsToMetadata} from '../../../../relations/belongs-to/belongs-to.helpers';

describe('resolveBelongsToMetadata', () => {
  it('throws if the wrong metadata type is used', async () => {
    const metadata: unknown = {
      name: 'category',
      type: RelationType.hasOne,
      targetsMany: false,
      source: Category,
      target: () => Category,
    };

    expect(() => {
      resolveBelongsToMetadata(metadata as BelongsToDefinition);
    }).to.throw(
      /Invalid hasOne definition for Category#category: relation type must be BelongsTo/,
    );
  });

  describe('keyTo and keyFrom with resolveHasManyMetadata', () => {
    it('throws if the target model does not have the id property', async () => {
      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        keyFrom: 'categoryId',

        target: () => Category,
        keyTo: 'id',
      };

      expect(() => {
        resolveBelongsToMetadata(metadata as BelongsToDefinition);
      }).to.throw(
        /Invalid belongsTo definition for Product#category: Category does not have any primary key \(id property\)/,
      );
    });

    it('resolves metadata using keyTo and keyFrom', () => {
      Category.definition.addProperty('id', {
        type: 'number',
        id: true,
        required: true,
      });

      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        keyFrom: 'categoryId',

        target: () => Category,
        keyTo: 'id',
      };

      const meta = resolveBelongsToMetadata(metadata as BelongsToDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,
        source: Product,
        keyFrom: 'categoryId',
        target: () => Category,
        keyTo: 'id',
        polymorphic: false,
      });
    });

    it('resolves metadata using polymorphic', () => {
      Category.definition.addProperty('productType', {
        type: 'string',
        required: true,
      });

      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        keyFrom: 'categoryId',

        target: () => Category,
        keyTo: 'id',

        polymorphic: {discriminator: 'productType'},
      };

      const meta = resolveBelongsToMetadata(metadata as BelongsToDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,
        source: Product,
        keyFrom: 'categoryId',
        target: () => Category,
        keyTo: 'id',
        polymorphic: {discriminator: 'productType'},
      });
    });

    it('infers keyFrom if it is not provided', () => {
      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        // no keyFrom

        target: () => Category,
        keyTo: 'id',
      };

      const meta = resolveBelongsToMetadata(metadata as BelongsToDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,
        source: Product,
        keyFrom: 'categoryId',
        target: () => Category,
        keyTo: 'id',
        polymorphic: false,
      });
    });

    it('infers keyTo if it is not provided', () => {
      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        keyFrom: 'categoryId',

        target: () => Category,
        // no keyTo
      };

      const meta = resolveBelongsToMetadata(metadata as BelongsToDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,
        source: Product,
        keyFrom: 'categoryId',
        target: () => Category,
        keyTo: 'id',
        polymorphic: false,
      });
    });

    it('infers keyFrom and keyTo if they are not provided', async () => {
      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        // no keyFrom

        target: () => Category,
        // no keyTo
      };

      const meta = resolveBelongsToMetadata(metadata as BelongsToDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,
        source: Product,
        keyFrom: 'categoryId',
        target: () => Category,
        keyTo: 'id',
        polymorphic: false,
      });
    });

    it('infers polymorphic discriminator not provided', async () => {
      const metadata = {
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,

        source: Product,
        // no keyFrom

        target: () => Category,
        // no keyTo

        polymorphic: true,
        // no discriminator
      };

      const meta = resolveBelongsToMetadata(metadata as BelongsToDefinition);

      expect(meta).to.eql({
        name: 'category',
        type: RelationType.belongsTo,
        targetsMany: false,
        source: Product,
        keyFrom: 'categoryId',
        target: () => Category,
        keyTo: 'id',
        polymorphic: {discriminator: 'categoryType'},
      });
    });
  });

  /******  HELPERS *******/
  class Category extends Entity {}
  Category.definition = new ModelDefinition('Category');

  class Product extends Entity {}
  Product.definition = new ModelDefinition('Product')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    .addProperty('categoryId', {type: 'number'});
});
