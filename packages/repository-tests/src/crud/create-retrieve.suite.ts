// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AnyObject,
  Entity,
  EntityCrudRepository,
  findByForeignKeys,
  model,
  property,
} from '@loopback/repository';
import {expect, toJSON} from '@loopback/testlab';
import {MixedIdType} from '../helpers.repository-tests';
import {
  deleteAllModelsInDefaultDataSource,
  withCrudCtx,
} from '../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../types.repository-tests';

// Core scenarios around creating new model instances and retrieving them back
// Please keep this file short, put any advanced scenarios to other files
export function createRetrieveSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  @model()
  class Product extends Entity {
    @property({
      type: features.idType,
      id: true,
      generated: true,
      description: 'The unique identifier for a product',
    })
    id: MixedIdType;

    @property({type: 'string', required: true})
    name: string;

    @property()
    categoryId?: number;

    constructor(data?: Partial<Product>) {
      super(data);
    }
  }

  describe('create-retrieve', () => {
    before(deleteAllModelsInDefaultDataSource);

    let repo: EntityCrudRepository<Product, typeof Product.prototype.id>;
    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        repo = new repositoryClass(Product, ctx.dataSource);
        await ctx.dataSource.automigrate(Product.name);
      }),
    );

    beforeEach(async () => {
      await repo.deleteAll();
    });

    it('retrieves a newly created model with id set by the database', async () => {
      const created = await repo.create({name: 'Pencil', categoryId: 1});
      expect(created.toObject()).to.have.properties('id', 'name', 'categoryId');
      expect(created.id).to.be.ok();

      const found = await repo.findById(created.id);
      expect(toJSON(created)).to.deepEqual(toJSON(found));
    });

    it('retrieves a newly created model when id was transformed via JSON', async () => {
      const created = await repo.create({name: 'Pen', categoryId: 1});
      expect(created.id).to.be.ok();

      const id = (toJSON(created) as AnyObject).id;
      const found = await repo.findById(id);
      expect(toJSON(created)).to.deepEqual(toJSON(found));
    });

    it('retrieves an instance of a model from its foreign key value', async () => {
      const pens = await repo.create({name: 'Pens', categoryId: 1});
      const pencils = await repo.create({name: 'Pencils', categoryId: 2});
      const products = await findByForeignKeys(repo, 'categoryId', [1]);
      expect(products).deepEqual([pens]);
      expect(products).to.not.containDeep(pencils);
    });

    it('retrieves instances of a model from their foreign key value', async () => {
      const pens = await repo.create({name: 'Pens', categoryId: 1});
      const pencils = await repo.create({name: 'Pencils', categoryId: 2});
      const products = await findByForeignKeys(repo, 'categoryId', [1, 2]);
      expect(products).deepEqual([pens, pencils]);
    });
  });
}
