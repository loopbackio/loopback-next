// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
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
  const objectId = {id: ''};
  objectId.toString = function () {
    return this.id;
  };

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
    it('returns the string representation of the target fk value when provided with object id', () => {
      const inventoryItemId = Object.create(objectId, {id: {value: 'item-1'}});
      const departmentId = Object.create(objectId, {
        id: {value: 'department-1'},
      });

      const through1 = createDepartmentInventory({
        departmentId,
        inventoryItemId,
      });
      const result: Object[] = getTargetKeysFromThroughModels(
        relationMetaDataWithObjectId,
        [through1],
      );
      expect(result[0].toString()).to.deepEqual('item-1');
    });
    it('returns the string representation of the target fk values when provided with object id', () => {
      const inventoryItemId1 = Object.create(objectId, {id: {value: 'item-1'}});
      const inventoryItemId2 = Object.create(objectId, {id: {value: 'item-2'}});
      const departmentId = Object.create(objectId, {
        id: {value: 'department-1'},
      });

      const through1 = createDepartmentInventory({
        departmentId,
        inventoryItemId: inventoryItemId1,
      });
      const through2 = createDepartmentInventory({
        departmentId,
        inventoryItemId: inventoryItemId2,
      });
      const result: Object[] = getTargetKeysFromThroughModels(
        relationMetaDataWithObjectId,
        [through1, through2],
      );
      expect(result[0].toString()).to.containDeep('item-1');
      expect(result[1].toString()).to.containDeep('item-2');
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

  context('createTargetConstraintFromThroughWithCustomReferenceKeys', () => {
    it('creates constraint for searching target models', () => {
      const through1 = createFriend({
        id: 1,
        userId: 'user@gmail.com',
        friendId: 'friendUser@gmail.com',
      });
      const through2 = createFriend({
        id: 2,
        userId: 'user1@gmail.com',
        friendId: 'friendUser1@gmail.com',
      });

      // single through model
      let result = createTargetConstraintFromThrough(
        relationMetaDataWithCustomReferenceKeys,
        [through1],
      );
      expect(result).to.containEql({email: 'friendUser@gmail.com'});
      // multiple through models
      result = createTargetConstraintFromThrough(
        relationMetaDataWithCustomReferenceKeys,
        [through1, through2],
      );
      expect(result).to.containEql({
        email: {inq: ['friendUser@gmail.com', 'friendUser1@gmail.com']},
      });
    });
  });

  context('getTargetIdsFromTargetModelsForCustomReferenceKeys', () => {
    it('returns an empty array if the given target array is empty', () => {
      const result = getTargetIdsFromTargetModels(
        relationMetaDataWithCustomReferenceKeys,
        [],
      );
      expect(result).to.containDeep([]);
    });
    it('creates constraint with a given fk', () => {
      const result = getTargetIdsFromTargetModels(
        relationMetaDataWithCustomReferenceKeys,
        [createUser({id: 1, email: 'user@gmail.com'})],
      );
      expect(result).to.containDeep(['user@gmail.com']);
    });
    it('creates constraint with given fks', () => {
      const result = getTargetIdsFromTargetModels(
        relationMetaDataWithCustomReferenceKeys,
        [
          createUser({id: 1, email: 'user@gmail.com'}),
          createUser({id: 2, email: 'user1@gmail.com'}),
        ],
      );
      expect(result).to.containDeep(['user@gmail.com', 'user1@gmail.com']);
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
    it('creates constraint with a given object id fk', () => {
      const departmentId = Object.create(objectId, {
        id: {value: 'department-1'},
      });
      const result: Object[] = getTargetIdsFromTargetModels(
        relationMetaDataWithObjectId,
        [createDepartment({id: departmentId})],
      );
      expect(result[0].toString()).to.containDeep('department-1');
    });
    it('creates constraint with given object id fks', () => {
      const departmentId1 = Object.create(objectId, {
        id: {value: 'department-1'},
      });
      const departmentId2 = Object.create(objectId, {
        id: {value: 'department-2'},
      });
      const result: Object[] = getTargetIdsFromTargetModels(
        relationMetaDataWithObjectId,
        [
          createDepartment({id: departmentId1}),
          createDepartment({id: departmentId2}),
        ],
      );
      expect(result[0].toString()).to.containDeep('department-1');
      expect(result[1].toString()).to.containDeep('department-2');
    });
  });

  context('createThroughConstraintFromTargetWithCustomReferenceKeys', () => {
    it('creates constraint with a given fk', () => {
      const result = createThroughConstraintFromTarget(
        relationMetaDataWithCustomReferenceKeys,
        ['user@gmail.com'],
      );
      expect(result).to.containEql({friendId: 'user@gmail.com'});
    });
    it('creates constraint with given fks', () => {
      const result = createThroughConstraintFromTarget(
        relationMetaDataWithCustomReferenceKeys,
        ['user@gmail.com', 'user1@gmail.com'],
      );
      expect(result).to.containEql({
        friendId: {inq: ['user@gmail.com', 'user1@gmail.com']},
      });
    });
    it('throws if fkValue is undefined', () => {
      expect(() =>
        createThroughConstraintFromTarget(
          relationMetaDataWithCustomReferenceKeys,
          [],
        ),
      ).to.throw(/"fkValue" must be provided/);
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

  context('resolveHasManyThroughMetadataWithCustomReferenceKeys', () => {
    it('throws if the wrong metadata type is used', async () => {
      const metadata = {
        name: 'friends',
        type: 'hasMany',
        targetsMany: true,
        source: User,
        customReferenceKeyFrom: 'email',
        customReferenceKeyTo: 'email',
        keyFrom: 'id',
        target: () => User,
        keyTo: 'id',
        through: {
          model: () => Friend,
          keyFrom: 'userId',
          keyTo: 'friendId',
          polymorphic: false,
        },
      };

      const result = resolveHasManyThroughMetadata(
        metadata as HasManyDefinition,
      );

      expect(result).to.containEql({
        name: 'friends',
        type: 'hasMany',
        customReferenceKeyFrom: 'email',
        customReferenceKeyTo: 'email',
      });

      expect(result).containDeep({through: {keyTo: 'friendId'}});
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

  @model()
  class Department extends Entity {
    @property({
      type: 'string',
      id: true,
      generated: true,
      mongodb: {dataType: 'ObjectId'},
    })
    id?: string;

    constructor(data: Partial<Department>) {
      super(data);
    }
  }

  @model()
  class InventoryItem extends Entity {
    @property({
      type: 'string',
      id: true,
      generated: true,
      mongodb: {dataType: 'ObjectId'},
    })
    id?: string;

    constructor(data: Partial<InventoryItem>) {
      super(data);
    }
  }

  @model()
  class DepartmentInventory extends Entity {
    @property({
      type: 'string',
      id: true,
      generated: true,
      mongodb: {dataType: 'ObjectId'},
    })
    id?: string;
    @property()
    departmentId: string;
    @property()
    inventoryItemId: string;

    constructor(data: Partial<DepartmentInventory>) {
      super(data);
    }
  }

  @model()
  class User extends Entity {
    @property({id: true})
    id: number;

    @property({})
    email: string;

    constructor(data: Partial<User>) {
      super(data);
    }
  }

  @model()
  class Friend extends Entity {
    @property({id: true})
    id: number;

    @property({})
    userId: string;

    @property({})
    friendId: string;

    constructor(data: Partial<Friend>) {
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

  const relationMetaDataWithObjectId = {
    name: 'departments',
    type: 'hasMany',
    targetsMany: true,
    source: Department,
    keyFrom: 'id',
    target: () => InventoryItem,
    keyTo: 'id',
    through: {
      model: () => DepartmentInventory,
      keyFrom: 'departmentId',
      keyTo: 'inventoryItemId',
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

  const relationMetaDataWithCustomReferenceKeys = {
    name: 'friends',
    type: 'hasMany',
    targetsMany: true,
    source: User,
    customReferenceKeyFrom: 'email',
    customReferenceKeyTo: 'email',
    keyFrom: 'id',
    target: () => User,
    keyTo: 'id',
    through: {
      model: () => Friend,
      keyFrom: 'userId',
      keyTo: 'friendId',
      polymorphic: false,
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

  function createFriend(properties: Partial<Friend>) {
    return new Friend(properties);
  }
  function createCategoryProductLink(properties: Partial<CategoryProductLink>) {
    return new CategoryProductLink(properties);
  }
  function createUser(properties: Partial<User>) {
    return new User(properties);
  }
  function createProduct(properties: Partial<Product>) {
    return new Product(properties);
  }
  function createDepartmentInventory(properties: Partial<DepartmentInventory>) {
    return new DepartmentInventory(properties);
  }
  function createDepartment(properties: Partial<Department>) {
    return new Department(properties);
  }
});
