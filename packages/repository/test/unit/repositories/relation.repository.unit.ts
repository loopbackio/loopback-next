// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {sinon, expect} from '@loopback/testlab';
import {
  EntityCrudRepository,
  HasManyRepository,
  DefaultCrudRepository,
  juggler,
  DefaultHasManyEntityCrudRepository,
  Entity,
  AnyObject,
  Filter,
  Options,
  DataObject,
  Where,
  resolveHasManyMetadata,
  HasManyDefinition,
  RelationType,
  ModelDefinition,
  BelongsToDefinition,
  resolveBelongsToMetadata,
} from '../../..';

describe('relation repository', () => {
  context('HasManyRepository interface', () => {
    /**
     * The class below is declared as test for the HasManyEntityCrudRepository
     * interface. The TS Compiler will complain if the interface changes.
     */

    // tslint:disable-next-line:no-unused-variable
    class testHasManyEntityCrudRepository<
      T extends Entity,
      ID,
      TargetRepository extends EntityCrudRepository<T, ID>
    > implements HasManyRepository<T> {
      create(
        targetModelData: DataObject<T>,
        options?: AnyObject | undefined,
      ): Promise<T> {
        /* istanbul ignore next */
        throw new Error('Method not implemented.');
      }
      find(
        filter?: Filter | undefined,
        options?: AnyObject | undefined,
      ): Promise<T[]> {
        /* istanbul ignore next */
        throw new Error('Method not implemented.');
      }
      async delete(where?: Where, options?: Options): Promise<number> {
        /* istanbul ignore next */
        throw new Error('Method not implemented.');
      }
      async patch(
        dataObject: DataObject<T>,
        where?: Where,
        options?: Options,
      ): Promise<number> {
        /* istanbul ignore next */
        throw new Error('Method not implemented.');
      }
    }
  });

  context('DefaultHasManyEntityCrudRepository', () => {
    it('can take in a repository instance as an argument', () => {
      const HasManyCrudInstance = givenDefaultHasManyCrudInstance({});
      expect(HasManyCrudInstance.targetRepositoryGetter()).to.eql(
        Promise.resolve(repo),
      );
    });

    it('can take in a repository getter as an argument', () => {
      repo = sinon.createStubInstance(CustomerRepository);
      const repoGetter = () => Promise.resolve(repo);
      const HasManyCrudInstance = new DefaultHasManyEntityCrudRepository(
        repoGetter,
        {},
      );
      expect(HasManyCrudInstance)
        .to.have.property('targetRepositoryGetter')
        .which.eql(repoGetter);
    });

    it('can create related model instance', async () => {
      const constraint: Partial<Customer> = {age: 25};
      const HasManyCrudInstance = givenDefaultHasManyCrudInstance(constraint);
      await HasManyCrudInstance.create({id: 1, name: 'Joe'});
      const createStub = repo.create as sinon.SinonStub;
      sinon.assert.calledWithMatch(createStub, {id: 1, name: 'Joe', age: 25});
    });

    it('can find related model instance', async () => {
      const constraint: Partial<Customer> = {name: 'Jane'};
      const HasManyCrudInstance = givenDefaultHasManyCrudInstance(constraint);
      await HasManyCrudInstance.find({where: {id: 3}});
      const findStub = repo.find as sinon.SinonStub;
      sinon.assert.calledWithMatch(findStub, {where: {id: 3, name: 'Jane'}});
    });

    context('patch', async () => {
      it('can patch related model instance', async () => {
        const constraint: Partial<Customer> = {name: 'Jane'};
        const HasManyCrudInstance = givenDefaultHasManyCrudInstance(constraint);
        await HasManyCrudInstance.patch({country: 'US'}, {id: 3});
        const patchStub = repo.updateAll as sinon.SinonStub;
        sinon.assert.calledWith(
          patchStub,
          {country: 'US', name: 'Jane'},
          {id: 3, name: 'Jane'},
        );
      });

      it('cannot override the constrain data', async () => {
        const constraint: Partial<Customer> = {name: 'Jane'};
        const HasManyCrudInstance = givenDefaultHasManyCrudInstance(constraint);
        await expect(
          HasManyCrudInstance.patch({name: 'Joe'}),
        ).to.be.rejectedWith(/Property "name" cannot be changed!/);
      });
    });

    it('can delete related model instance', async () => {
      const constraint: Partial<Customer> = {name: 'Jane'};
      const HasManyCrudInstance = givenDefaultHasManyCrudInstance(constraint);
      await HasManyCrudInstance.delete({id: 3});
      const deleteStub = repo.deleteAll as sinon.SinonStub;
      sinon.assert.calledWith(deleteStub, {id: 3, name: 'Jane'});
    });
  });

  context('resolveHasManyMetadata', () => {
    it('retains non-resolver type', () => {
      class TargetModel extends Entity {}
      const meta: HasManyDefinition = {
        type: RelationType.hasMany,
        target: TargetModel,
      };
      const result = resolveHasManyMetadata(meta);

      expect(result).to.eql(meta);
    });

    it('throws if no target relation metadata is found', () => {
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetModel',
        });
      }
      const meta: HasManyDefinition = {
        type: RelationType.hasMany,
        target: () => TargetModel,
      };
      expect(() => resolveHasManyMetadata(meta)).to.throw(
        /no belongsTo metadata found/,
      );
    });

    it('throws if no belongsTo metadata is found', () => {
      class SourceModel extends Entity {}
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetModel',
          relations: {
            foreignId: {type: RelationType.hasMany, target: () => SourceModel},
          },
        });
      }
      const meta: HasManyDefinition = {
        type: RelationType.hasMany,
        target: () => TargetModel,
      };
      expect(() => resolveHasManyMetadata(meta)).to.throw(
        /no belongsTo metadata found/,
      );
    });

    it('retains predefined keyTo property', () => {
      class TargetModel extends Entity {}
      const meta: HasManyDefinition = {
        type: RelationType.hasMany,
        target: () => TargetModel,
        keyTo: 'someOtherForeignId',
      };
      const result = resolveHasManyMetadata(meta);
      const expected: HasManyDefinition = {
        type: RelationType.hasMany,
        target: () => TargetModel,
        keyTo: 'someOtherForeignId',
      };
      expect(result).to.eql(expected);
    });

    it('infers keyTo from property decorated with @belongsTo on target model', () => {
      class SourceModel extends Entity {}
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetModel',
          relations: {
            foreignId: {
              type: RelationType.belongsTo,
              target: () => SourceModel,
            },
          },
        });
      }
      const meta: HasManyDefinition = {
        type: RelationType.hasMany,
        target: () => TargetModel,
      };
      const result = resolveHasManyMetadata(meta);
      const expected: HasManyDefinition = {
        type: RelationType.hasMany,
        target: () => TargetModel,
        keyTo: 'foreignId',
      };
      expect(result).to.eql(expected);
    });
  });

  context('resolveBelongsToMetadata', () => {
    it('retains non-resolver type', () => {
      class TargetModel extends Entity {}
      const meta: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: TargetModel,
      };
      const result = resolveBelongsToMetadata(meta);

      expect(result).to.eql(meta);
    });

    it('throws if no target definition metadata is found', () => {
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetModel',
        });
      }
      const meta: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => TargetModel,
      };
      expect(() => resolveBelongsToMetadata(meta)).to.throw(
        /no id metadata found/,
      );
    });

    it('throws if no belongsTo metadata is found', () => {
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetModel',
          properties: {
            propertyThatIsNotId: {type: 'number'},
          },
        });
      }
      const meta: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => TargetModel,
      };
      expect(() => resolveBelongsToMetadata(meta)).to.throw(
        /no id metadata found/,
      );
    });

    it('retains predefined keyTo property', () => {
      class TargetModel extends Entity {}
      const meta: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => TargetModel,
        keyTo: 'someOtherForeignId',
      };
      const result = resolveBelongsToMetadata(meta);
      const expected: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => TargetModel,
        keyTo: 'someOtherForeignId',
      };
      expect(result).to.eql(expected);
    });

    it('infers keyTo from property decorated with @property({id: true}) on target model', () => {
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetModel',
          properties: {anId: {type: 'number', id: true}},
        });
      }
      const meta: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => TargetModel,
      };
      const result = resolveBelongsToMetadata(meta);
      const expected: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => TargetModel,
        keyTo: 'anId',
      };
      expect(result).to.eql(expected);
    });
  });

  /*------------- HELPERS ---------------*/

  class Customer extends Entity {
    id: number;
    name: string;
    age: number;
    country: string;
  }

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Customer, dataSource);
    }
  }

  let repo: CustomerRepository;

  function givenDefaultHasManyCrudInstance(constraint: DataObject<Customer>) {
    repo = sinon.createStubInstance(CustomerRepository);
    return new DefaultHasManyEntityCrudRepository<
      Customer,
      typeof Customer.prototype.id,
      CustomerRepository
    >(repo, constraint);
  }
});
