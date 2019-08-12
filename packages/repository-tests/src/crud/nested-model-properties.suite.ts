// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository,
  Entity,
  EntityCrudRepository,
  juggler,
  model,
  property,
} from '@loopback/repository';
import {expect, toJSON} from '@loopback/testlab';
import {
  deleteAllModelsInDefaultDataSource,
  withCrudCtx,
  MixedIdType,
} from '../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../types.repository-tests';

export function nestedModelsPropertiesSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('Nested models properties', () => {
    let db: juggler.DataSource;
    let userRepo: EntityCrudRepository<User, typeof User.prototype.id>;

    before(deleteAllModelsInDefaultDataSource);

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        db = ctx.dataSource;
        userRepo = new DefaultCrudRepository<User, typeof User.prototype.id>(
          User,
          db,
        );
        const models = [User];
        await db.automigrate(models.map(m => m.name));
      }),
    );
    beforeEach(async function resetDatabase() {
      await userRepo.deleteAll();
    });

    it('allows models to allow a singel nested model property', async () => {
      const user = {
        name: 'foo',
        roles: [],
        address: {street: 'backstreet'},
      };
      const created = await userRepo.create(user);

      const stored = await userRepo.findById(created.id);
      expect(toJSON(stored)).to.containDeep(toJSON(user));
    });

    it('allows models to allow multiple nested model properties in an array', async () => {
      const user = {
        name: 'foo',
        roles: [{name: 'admin'}, {name: 'user'}],
        address: {street: 'backstreet'},
      };
      const created = await userRepo.create(user);

      const stored = await userRepo.findById(created.id);
      expect(toJSON(stored)).to.containDeep(toJSON(user));
    });

    @model()
    class Role extends Entity {
      @property()
      name: string;
    }

    @model()
    class Address extends Entity {
      @property()
      street: string;
    }

    @model()
    class User extends Entity {
      @property({
        id: true,
        generated: true,
      })
      id: MixedIdType;

      @property({type: 'string'})
      name: string;

      @property.array(Role)
      roles: Role[];

      @property()
      address: Address;
    }
  });
}
