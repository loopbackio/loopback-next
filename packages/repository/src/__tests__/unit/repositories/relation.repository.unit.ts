// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {
  AnyObject,
  Count,
  DataObject,
  DefaultCrudRepository,
  DefaultHasManyRepository,
  Entity,
  Filter,
  HasManyRepository,
  juggler,
  Options,
  Where,
} from '../../..';

describe('relation repository', () => {
  let customerRepo: StubbedInstanceWithSinonAccessor<CustomerRepository>;

  beforeEach(setupStubbedCustomerRepository);

  context('HasManyRepository interface', () => {
    /**
     * The class below is declared as test for the HasManyEntityCrudRepository
     * interface. The TS Compiler will complain if the interface changes.
     */

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestHasManyEntityCrudRepository<T extends Entity>
      implements HasManyRepository<T> {
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
      async delete(where?: Where, options?: Options): Promise<Count> {
        /* istanbul ignore next */
        throw new Error('Method not implemented.');
      }
      async patch(
        dataObject: DataObject<T>,
        where?: Where,
        options?: Options,
      ): Promise<Count> {
        /* istanbul ignore next */
        throw new Error('Method not implemented.');
      }
    }
  });

  context('DefaultHasManyEntityCrudRepository', () => {
    it('can create related model instance', async () => {
      const constraint: Partial<Customer> = {age: 25};
      const hasManyCrudInstance = givenDefaultHasManyInstance(constraint);
      await hasManyCrudInstance.create({id: 1, name: 'Joe'});
      sinon.assert.calledWithMatch(customerRepo.stubs.create, {
        id: 1,
        name: 'Joe',
        age: 25,
      });
    });

    it('can find related model instance', async () => {
      const constraint: Partial<Customer> = {name: 'Jane'};
      const hasManyCrudInstance = givenDefaultHasManyInstance(constraint);
      await hasManyCrudInstance.find({where: {id: 3}});
      sinon.assert.calledWithMatch(customerRepo.stubs.find, {
        where: {id: 3, name: 'Jane'},
      });
    });

    context('patch', () => {
      it('can patch related model instance', async () => {
        const constraint: Partial<Customer> = {name: 'Jane'};
        const hasManyCrudInstance = givenDefaultHasManyInstance(constraint);
        await hasManyCrudInstance.patch({country: 'US'}, {id: 3});
        sinon.assert.calledWith(
          customerRepo.stubs.updateAll,
          {country: 'US', name: 'Jane'},
          {id: 3, name: 'Jane'},
        );
      });

      it('cannot override the constrain data', async () => {
        const constraint: Partial<Customer> = {name: 'Jane'};
        const hasManyCrudInstance = givenDefaultHasManyInstance(constraint);
        await expect(
          hasManyCrudInstance.patch({name: 'Joe'}),
        ).to.be.rejectedWith(/Property "name" cannot be changed!/);
      });
    });

    it('can delete related model instance', async () => {
      const constraint: Partial<Customer> = {name: 'Jane'};
      const hasManyCrudInstance = givenDefaultHasManyInstance(constraint);
      await hasManyCrudInstance.delete({id: 3});
      sinon.assert.calledWith(customerRepo.stubs.deleteAll, {
        id: 3,
        name: 'Jane',
      });
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

  function setupStubbedCustomerRepository() {
    customerRepo = createStubInstance(CustomerRepository);
  }

  function givenDefaultHasManyInstance(constraint: DataObject<Customer>) {
    return new DefaultHasManyRepository<
      Customer,
      typeof Customer.prototype.id,
      CustomerRepository
    >(Getter.fromValue(customerRepo), constraint);
  }
});
