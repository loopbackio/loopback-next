// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  HasManyDefinition,
  model,
  ModelDefinition,
  property,
  RelationType,
} from '../../../..';
import {
  createTargetConstraintFromThrough,
  createThroughConstraintFromSource,
  createThroughConstraintFromTarget,
  getTargetIdsFromTargetModels,
  getTargetKeysFromThroughModels,
  HasManyThroughResolvedDefinition,
  resolveHasManyThroughMetadata,
} from '../../../../relations/has-many/has-many-through.helpers';

describe('HasManyThroughHelpers', () => {
  context('createThroughConstraintFromSource', () => {
    it('creates constraint for searching through models', () => {
      const result = createThroughConstraintFromSource(relationMetaData, 1);
      expect(result).to.containEql({categoryId: 1});
    });
  });
  context('getTargetKeysFromThroughModels', () => {
    it('returns the target fk value of a given through instance', () => {
      const through1 = createCategoryProductLink({
        id: 1,
        categoryId: 2,
        productId: 9,
      });
      const result = getTargetKeysFromThroughModels(relationMetaData, [
        through1,
      ]);
      expect(result).to.deepEqual([9]);
    });
    it('returns the target fk values of given through instances', () => {
      const through1 = createCategoryProductLink({
        id: 1,
        categoryId: 2,
        productId: 9,
      });
      const through2 = createCategoryProductLink({
        id: 2,
        categoryId: 2,
        productId: 8,
      });
      const result = getTargetKeysFromThroughModels(relationMetaData, [
        through1,
        through2,
      ]);
      expect(result).to.containDeep([9, 8]);
    });
  });
  context('createTargetConstraintFromThrough', () => {
    it('creates constraint for searching target models', () => {
      const through1 = createCategoryProductLink({
        id: 1,
        categoryId: 2,
        productId: 9,
      });
      const through2 = createCategoryProductLink({
        id: 2,
        categoryId: 2,
        productId: 8,
      });

      // single through model
      let result = createTargetConstraintFromThrough(relationMetaData, [
        through1,
      ]);
      expect(result).to.containEql({id: 9});
      // multiple through models
      result = createTargetConstraintFromThrough(relationMetaData, [
        through1,
        through2,
      ]);
      expect(result).to.containEql({id: {inq: [9, 8]}});
    });

    it('creates constraint for searching target models with duplicate keys', () => {
      const through1 = createCategoryProductLink({
        id: 1,
        categoryId: 2,
        productId: 9,
      });
      const through2 = createCategoryProductLink({
        id: 2,
        categoryId: 3,
        productId: 9,
      });

      const result = createTargetConstraintFromThrough(relationMetaData, [
        through1,
        through2,
      ]);
      expect(result).to.containEql({id: 9});
    });
  });

  context('getTargetIdsFromTargetModels', () => {
    it('returns an empty array if the given target array is empty', () => {
      const result = getTargetIdsFromTargetModels(relationMetaData, []);
      expect(result).to.containDeep([]);
    });
    it('creates constraint with a given fk', () => {
      const result = getTargetIdsFromTargetModels(relationMetaData, [
        createProduct({id: 1}),
      ]);
      expect(result).to.containDeep([1]);
    });
    it('creates constraint with given fks', () => {
      const result = getTargetIdsFromTargetModels(relationMetaData, [
        createProduct({id: 1}),
        createProduct({id: 2}),
      ]);
      expect(result).to.containDeep([1, 2]);
    });
  });

  context('createThroughConstraintFromTarget', () => {
    it('creates constraint with a given fk', () => {
      const result = createThroughConstraintFromTarget(relationMetaData, [1]);
      expect(result).to.containEql({productId: 1});
    });
    it('creates constraint with given fks', () => {
      const result = createThroughConstraintFromTarget(
        relationMetaData,
        [1, 2],
      );
      expect(result).to.containEql({productId: {inq: [1, 2]}});
    });
    it('throws if fkValue is undefined', () => {
      expect(() =>
        createThroughConstraintFromTarget(relationMetaData, []),
      ).to.throw(/"fkValue" must be provided/);
    });
  });
  context('resolveHasManyThroughMetadata', () => {
    it('throws if the wrong metadata type is used', async () => {
      const metadata: unknown = {
        name: 'category',
        type: RelationType.hasOne,
        targetsMany: false,
        source: Category,
        target: () => Product,
      };

      expect(() => {
        resolveHasManyThroughMetadata(metadata as HasManyDefinition);
      }).to.throw(
        /Invalid hasOne definition for Category#category: relation type must be HasMany/,
      );
    });

    it('throws if the through is not provided', async () => {
      const metadata: unknown = {
        name: 'category',
        type: RelationType.hasMany,
        targetsMany: true,
        source: Category,
        target: () => Product,
      };

      expect(() => {
        resolveHasManyThroughMetadata(metadata as HasManyDefinition);
      }).to.throw(
        /Invalid hasMany definition for Category#category: through must be specified/,
      );
    });

    it('throws if the through is not resolvable', async () => {
      const metadata: unknown = {
        name: 'category',
        type: RelationType.hasMany,
        targetsMany: true,
        source: Category,
        through: {model: 'random'},
        target: () => Product,
      };

      expect(() => {
        resolveHasManyThroughMetadata(metadata as HasManyDefinition);
      }).to.throw(
        /Invalid hasMany definition for Category#category: through.model must be a type resolver/,
      );
    });

    describe('resolves through.keyTo/keyFrom/polymorphic', () => {
      it('resolves metadata with complete hasManyThrough definition', () => {
        const metadata = {
          name: 'products',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => Product,
          keyTo: 'id',

          through: {
            model: () => CategoryProductLink,
            keyFrom: 'categoryId',
            keyTo: 'productId',
            polymorphic: {discriminator: 'productType'},
          },
        };
        const meta = resolveHasManyThroughMetadata(
          metadata as HasManyDefinition,
        );

        expect(meta).to.eql(relationMetaDataWithPolymorphicDiscriminator);
      });

      it('infers through.keyFrom if it is not provided', () => {
        const metadata = {
          name: 'products',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => Product,
          keyTo: 'id',

          through: {
            model: () => CategoryProductLink,
            // no through.keyFrom
            keyTo: 'productId',
          },
        };
        const meta = resolveHasManyThroughMetadata(
          metadata as HasManyDefinition,
        );

        expect(meta).to.eql(relationMetaData);
      });

      it('infers through.keyTo if it is not provided', () => {
        const metadata = {
          name: 'products',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => Product,
          keyTo: 'id',

          through: {
            model: () => CategoryProductLink,
            keyFrom: 'categoryId',
            // no through.keyTo
          },
        };

        const meta = resolveHasManyThroughMetadata(
          metadata as HasManyDefinition,
        );

        expect(meta).to.eql(relationMetaData);
      });

      it('infers through.polymorphic.discriminator if polymorphic equals to true', () => {
        const metadata = {
          name: 'products',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => Product,
          keyTo: 'id',

          through: {
            model: () => CategoryProductLink,
            keyFrom: 'categoryId',
            keyTo: 'productId',
            polymorphic: true,
          },
        };

        const meta = resolveHasManyThroughMetadata(
          metadata as HasManyDefinition,
        );

        expect(meta).to.eql(relationMetaDataWithPolymorphicDiscriminator);
      });

      it('throws if through.keyFrom is not provided in through', async () => {
        const metadata = {
          name: 'categories',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => Product,
          keyTo: 'id',

          through: {
            model: () => InvalidThrough,
            keyTo: 'productId',
          },
        };

        expect(() => {
          resolveHasManyThroughMetadata(metadata as HasManyDefinition);
        }).to.throw(
          /Invalid hasMany definition for Category#categories: through model InvalidThrough is missing definition of source foreign key/,
        );
      });

      it('throws if through.keyTo is not provided in through', async () => {
        const metadata = {
          name: 'categories',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => Product,
          keyTo: 'id',

          through: {
            model: () => InvalidThrough2,
            keyFrom: 'categoryId',
          },
        };

        expect(() => {
          resolveHasManyThroughMetadata(metadata as HasManyDefinition);
        }).to.throw(
          /Invalid hasMany definition for Category#categories: through model InvalidThrough2 is missing definition of target foreign key/,
        );
      });

      it('throws if the target model does not have the id property', async () => {
        const metadata = {
          name: 'categories',
          type: RelationType.hasMany,
          targetsMany: true,
          source: Category,
          keyFrom: 'id',
          target: () => InvalidProduct,
          keyTo: 'id',

          through: {
            model: () => CategoryProductLink,
            keyFrom: 'categoryId',
            keyTo: 'productId',
          },
        };

        expect(() => {
          resolveHasManyThroughMetadata(metadata as HasManyDefinition);
        }).to.throw(
          'Invalid hasMany definition for Category#categories: target model InvalidProduct does not have any primary key (id property)',
        );
      });
    });
  });
  /******  HELPERS *******/

  @model()
  class Category extends Entity {
    @property({id: true})
    id: number;

    constructor(data: Partial<Category>) {
      super(data);
    }
  }

  @model()
  class Product extends Entity {
    @property({id: true})
    id: number;

    constructor(data: Partial<Product>) {
      super(data);
    }
  }

  @model()
  class InvalidProduct extends Entity {
    @property({id: false})
    random: number;
    constructor(data: Partial<InvalidProduct>) {
      super(data);
    }
  }

  @model()
  class CategoryProductLink extends Entity {
    @property({id: true})
    id: number;
    @property()
    categoryId: number;
    @property()
    productId: number;

    constructor(data: Partial<Product>) {
      super(data);
    }
  }

  const relationMetaData = {
    name: 'products',
    type: 'hasMany',
    targetsMany: true,
    source: Category,
    keyFrom: 'id',
    target: () => Product,
    keyTo: 'id',
    through: {
      model: () => CategoryProductLink,
      keyFrom: 'categoryId',
      keyTo: 'productId',
      polymorphic: false,
    },
  } as HasManyThroughResolvedDefinition;

  const relationMetaDataWithPolymorphicDiscriminator = {
    name: 'products',
    type: 'hasMany',
    targetsMany: true,
    source: Category,
    keyFrom: 'id',
    target: () => Product,
    keyTo: 'id',
    through: {
      model: () => CategoryProductLink,
      keyFrom: 'categoryId',
      keyTo: 'productId',
      polymorphic: {discriminator: 'productType'},
    },
  } as HasManyThroughResolvedDefinition;

  class InvalidThrough extends Entity {}
  InvalidThrough.definition = new ModelDefinition('InvalidThrough')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    // lack through.keyFrom
    .addProperty('productId', {type: 'number'});

  class InvalidThrough2 extends Entity {}
  InvalidThrough2.definition = new ModelDefinition('InvalidThrough2')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    // lack through.keyTo
    .addProperty('categoryId', {type: 'number'});

  function createCategoryProductLink(properties: Partial<CategoryProductLink>) {
    return new CategoryProductLink(properties);
  }
  function createProduct(properties: Partial<Product>) {
    return new Product(properties);
  }
});
