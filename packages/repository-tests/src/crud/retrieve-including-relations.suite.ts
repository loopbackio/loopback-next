// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  hasInclusionResolvers,
  hasMany,
  HasManyDefinition,
  HasManyInclusionResolver,
  model,
  property,
} from '@loopback/repository';
import {expect, skipIf} from '@loopback/testlab';
import {Suite} from 'mocha';
import {withCrudCtx} from '../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../types.repository-tests';

// Core scenarios around retrieving model instances with related model includes
// Please keep this file short, put any advanced scenarios to other files
export function retrieveIncludingRelationsSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  @model()
  class Category extends Entity {
    @property({
      type: features.idType,
      id: true,
      generated: true,
    })
    id: number | string;

    @property({type: 'string', required: true})
    name: string;

    @hasMany(() => Item)
    items?: Item[];
    constructor(data?: Partial<Category>) {
      super(data);
    }
  }

  interface CategoryRelations {
    items?: Item[];
  }

  @model()
  class Item extends Entity {
    @property({
      type: features.idType,
      id: true,
      generated: true,
    })
    id: number | string;

    @property({type: 'string', required: true})
    name: string;

    @property({
      type: features.idType,
      required: true,
      // hacky workaround, we need a more generic solution that will allow
      // any connector to contribute additional metadata for foreign keys
      // ideally, we should use database-agnostic "references" field
      // as proposed in https://github.com/strongloop/loopback-next/issues/2766
      mongodb: {
        dataType: 'ObjectID',
      },
    })
    categoryId: number | string;

    constructor(data?: Partial<Item>) {
      super(data);
    }
  }

  interface ItemRelations {
    category?: Category;
  }

  skipIf<[(this: Suite) => void], void>(
    !features.inclusionResolvers,
    describe,
    'retrieve models including relations',
    () => {
      let categoryRepo: EntityCrudRepository<
        Category,
        typeof Category.prototype.id,
        CategoryRelations
      >;
      let itemRepo: EntityCrudRepository<
        Item,
        typeof Item.prototype.id,
        ItemRelations
      >;
      before(
        withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
          categoryRepo = new repositoryClass(Category, ctx.dataSource);
          itemRepo = new repositoryClass(Item, ctx.dataSource);

          if (!hasInclusionResolvers(categoryRepo)) {
            throw new Error(
              `Repository class "${
                categoryRepo.constructor.name
              }" must provide a public "inclusionResolvers" property`,
            );
          }

          const itemsMeta = Category.definition.relations.items;
          const itemsResolver = new HasManyInclusionResolver(
            itemsMeta as HasManyDefinition,
            async () => itemRepo,
          );
          categoryRepo.inclusionResolvers['items'] = itemsResolver;

          await ctx.dataSource.automigrate([Category.name, Item.name]);
        }),
      );

      it('ignores navigational properties when updating model instance', async () => {
        const created = await categoryRepo.create({name: 'Stationery'});
        const categoryId = created.id;

        await itemRepo.create({
          name: 'Pen',
          categoryId,
        });

        const found = await categoryRepo.findById(categoryId, {
          include: [{relation: 'items'}],
        });
        expect(found.items).to.have.lengthOf(1);

        found.name = 'updated name';
        const saved = await categoryRepo.save(found);
        expect(saved.name).to.equal('updated name');

        const loaded = await categoryRepo.findById(categoryId);
        expect(loaded.name).to.equal('updated name');
        expect(loaded).to.not.have.property('items');
      });
    },
  );
}
