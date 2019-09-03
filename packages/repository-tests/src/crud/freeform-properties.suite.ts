// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';
import {EntityCrudRepository} from '@loopback/repository';
import {expect, skipIf, toJSON} from '@loopback/testlab';
import {Suite} from 'mocha';
import {MixedIdType} from '../helpers.repository-tests';
import {
  withCrudCtx,
  deleteAllModelsInDefaultDataSource,
} from '../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../types.repository-tests';

export function freeformPropertiesSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.freeFormProperties,
    describe,
    'free-form properties (strict: false)',
    () => {
      before(deleteAllModelsInDefaultDataSource);

      @model({settings: {strict: false}})
      class Freeform extends Entity {
        @property({
          type: features.idType,
          id: true,
          description: 'The unique identifier for a product',
        })
        id: MixedIdType;

        @property({type: 'string', required: true})
        name: string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [propName: string]: any;

        constructor(data?: Partial<Freeform>) {
          super(data);
        }
      }

      let repo: EntityCrudRepository<Freeform, typeof Freeform.prototype.id>;

      before(
        withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
          repo = new repositoryClass(Freeform, ctx.dataSource);
          await ctx.dataSource.automigrate(Freeform.name);
        }),
      );

      it('stores extra properties on create', async () => {
        // FIXME(bajtos) Fix repository types so that explicit cast can be removed
        // ATM, compiler complains that {name: 'Pencil', color: 'red'} cannot be
        // assigned to DeepPartial<Product>
        const created = await repo.create(<Partial<Freeform>>{
          name: 'Pencil',
          color: 'red',
        });
        expect(created.toObject()).to.have.properties('id', 'name');
        expect(created.id).to.be.ok();

        const found = await repo.findById(created.id);
        expect(toJSON(created)).to.deepEqual(toJSON(found));
      });
    },
  );
}
