// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {expect, sinon} from '@loopback/testlab';
import {
  AnyObject,
  Count,
  DataObject,
  DefaultCrudRepository,
  DefaultHasManyEntityCrudRepository,
  Entity,
  EntityCrudRepository,
  Filter,
  HasManyRepository,
  juggler,
  Options,
  Where,
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
    >(Getter.fromValue(repo), constraint);
  }
});
