// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {sinon} from '@loopback/testlab';
import {
  EntityCrudRepository,
  HasManyEntityCrudRepository,
  DefaultCrudRepository,
  juggler,
  DefaultHasManyEntityCrudRepository,
  Entity,
  AnyObject,
  Filter,
} from '../../..';

describe('relation repository', () => {
  context('hasManyEntityCrudRepository interface', () => {
    /**
     * The class below is declared as test for the HasManyEntityCrudRepository
     * interface. The TS Compiler will complain if the interface changes.
     */

    // tslint:disable-next-line:no-unused-variable
    class testHasManyEntityCrudRepository<
      T extends Entity,
      TargetRepository extends EntityCrudRepository<
        T,
        typeof Entity.prototype.id
      >
    > implements HasManyEntityCrudRepository<T> {
      create(
        targetModelData: Partial<T>,
        options?: AnyObject | undefined,
      ): Promise<T> {
        throw new Error('Method not implemented.');
      }
      find(
        filter?: Filter | undefined,
        options?: AnyObject | undefined,
      ): Promise<T[]> {
        throw new Error('Method not implemented.');
      }
    }
  });

  context('DefaultHasManyEntityCrudRepository', () => {
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
  });

  /*------------- HELPERS ---------------*/

  class Customer extends Entity {
    id: number;
    name: string;
    age: number;
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

  function givenDefaultHasManyCrudInstance(constraint: AnyObject) {
    repo = sinon.createStubInstance(CustomerRepository);
    return new DefaultHasManyEntityCrudRepository(repo, constraint);
  }
});
