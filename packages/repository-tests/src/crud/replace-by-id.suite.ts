// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AnyObject,
  Entity,
  EntityCrudRepository,
  model,
  property,
} from '@loopback/repository';
import {expect, toJSON} from '@loopback/testlab';
import {
  deleteAllModelsInDefaultDataSource,
  MixedIdType,
  withCrudCtx,
} from '../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../types.repository-tests';

// Tests for `replaceById` method.
export function createSuiteForReplaceById(
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
      useDefaultIdType: true,
      description: 'The unique identifier for a product',
    })
    id: MixedIdType;

    // cloudant needs this property to do replacement method
    // see cloudant README file for more details
    @property({type: 'string', required: false})
    _rev: string;

    @property({type: 'string', required: true})
    name: string;

    @property({type: 'string', required: false})
    description?: string;

    constructor(data?: Partial<Product>) {
      super(data);
    }
  }

  describe('replaceById', () => {
    before(deleteAllModelsInDefaultDataSource);

    let repo: EntityCrudRepository<Product, typeof Product.prototype.id>;
    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        repo = new repositoryClass(Product, ctx.dataSource);
        await ctx.dataSource.automigrate(Product.name);
      }),
    );

    it('replaces all model properties (using model instance as data)', async () => {
      const created = await repo.create({
        name: 'Pencil',
        description: 'some description',
      });
      expect(created.id).to.be.ok();

      created.name = 'new name';
      // This important! Not all databases allow `patchById` to set
      // properties to "undefined", `replaceById` must always work.
      created.description = undefined;
      await repo.replaceById(created.id, created);

      const found = await repo.findById(created.id);
      // For connectors that use revision token, _rev gets changed after replacement
      // opertations. So the _rev value varies based on the flag `hasRevisionToken`.
      let revisionToken;
      /* istanbul ignore if */
      if (features.hasRevisionToken) {
        revisionToken = found._rev;
      } else {
        revisionToken = features.emptyValue;
      }

      expect(toJSON(found)).to.deepEqual(
        toJSON({
          id: created.id,
          _rev: revisionToken,
          name: 'new name',
          description: features.emptyValue,
        }),
      );
    });

    // This test simulates REST API scenario, where data returned from
    // the database is converted to JSON and client sends plain data object
    // encoded as JSON.
    it('replaces all model properties (using plain data object)', async () => {
      const created = toJSON(
        await repo.create({
          name: 'Pencil',
          description: 'some description',
        }),
      ) as AnyObject;
      expect(created.id).to.be.ok();

      created.name = 'new name';
      // This important! Not all databases allow `patchById` to set
      // properties to "undefined", `replaceById` must always work.
      created.description = undefined;
      await repo.replaceById(created.id, created);

      const found = await repo.findById(created.id);
      // For connectors that use revision token, _rev gets changed after replacement
      // opertations. So the _rev value varies based on the flag `hasRevisionToken`.
      let revisionToken;
      /* istanbul ignore if */
      if (features.hasRevisionToken) {
        revisionToken = found._rev;
      } else {
        revisionToken = features.emptyValue;
      }

      expect(toJSON(found)).to.deepEqual(
        toJSON({
          id: created.id,
          _rev: revisionToken,
          name: 'new name',
          description: features.emptyValue,
        }),
      );
    });
  });
}
