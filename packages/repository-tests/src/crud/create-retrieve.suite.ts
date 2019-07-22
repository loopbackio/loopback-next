// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';
import {EntityCrudRepository} from '@loopback/repository/src';
import {expect, toJSON} from '@loopback/testlab';
import {withCrudCtx} from '../helpers.repository-tests';
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
    id: number | string;

    @property({type: 'string', required: true})
    name: string;

    constructor(data?: Partial<Product>) {
      super(data);
    }
  }

  describe('create-retrieve', () => {
    let repo: EntityCrudRepository<Product, typeof Product.prototype.id>;
    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        repo = new repositoryClass(Product, ctx.dataSource);
        await ctx.dataSource.automigrate(Product.name);
      }),
    );

    it('retrieves a newly created model with id set by the database', async () => {
      const created = await repo.create({name: 'Pencil'});
      expect(created.toObject()).to.have.properties('id', 'name');
      expect(created.id).to.be.ok();

      const found = await repo.findById(created.id);
      expect(toJSON(created)).to.deepEqual(toJSON(found));
    });
  });
}
