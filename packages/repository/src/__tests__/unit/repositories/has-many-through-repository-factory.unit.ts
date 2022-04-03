// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createStubInstance, expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  Getter,
  juggler,
  model,
  property,
} from '../../..';
import {HasManyThroughResolvedDefinition} from '../../../relations/has-many/has-many-through.helpers';
import {createHasManyThroughRepositoryFactory} from '../../../relations/has-many/has-many-through.repository-factory';

describe('createHasManyThroughRepositoryFactory', () => {
  let categoryProductLinkRepo: CategoryProductLinkRepository;
  let productRepo: ProductRepository;

  beforeEach(() => {
    givenStubbedProductRepo();
    givenStubbedCategoryProductLinkRepo();
  });

  it('should return a function that could create hasManyThrough repository', () => {
    const relationMeta = resolvedMetadata as HasManyThroughResolvedDefinition;
    const result = createHasManyThroughRepositoryFactory(
      relationMeta,
      Getter.fromValue(productRepo),
      Getter.fromValue(categoryProductLinkRepo),
    );
    expect(result).to.be.Function();
  });

  /*------------- HELPERS ---------------*/

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

  class ProductRepository extends DefaultCrudRepository<
    Product,
    typeof Product.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Product, dataSource);
    }
  }

  class CategoryProductLinkRepository extends DefaultCrudRepository<
    CategoryProductLink,
    typeof CategoryProductLink.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(CategoryProductLink, dataSource);
    }
  }

  const resolvedMetadata = {
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
  };

  function givenStubbedProductRepo() {
    productRepo = createStubInstance(ProductRepository);
  }

  function givenStubbedCategoryProductLinkRepo() {
    categoryProductLinkRepo = createStubInstance(CategoryProductLinkRepository);
  }
});
