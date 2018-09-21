// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  juggler,
  UncheckedCrudRepository,
  UncheckedCrudRepositoryImpl,
  model,
} from '../../..';
import {property} from '../../../src';

describe('UnsafeCrudRepository', () => {
  const DUMMY_OPTIONS = {test: true};

  let unsafeRepository: UncheckedCrudRepository<
    Customer,
    typeof Customer.prototype.id
  >;

  let defaultRepo: DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  >;

  beforeEach(givenUnsafeCustomerRepository);

  context('.save()', () => {
    it('saves the entity', async () => {
      const entity = givenCustomer();
      const saved = await unsafeRepository.save(entity, DUMMY_OPTIONS);

      expect(saved).to.be.instanceof(Customer);
      expect(saved).to.containDeep(entity.toJSON());

      const found = await defaultRepo.findById(saved!.id);
      expect(found).to.deepEqual(saved);
    });

    it('returns `undefined` when saving unknown entity', async () => {
      const entity = await defaultRepo.create(givenCustomer());
      await defaultRepo.deleteById(entity.id);

      entity.age = 99;
      const result = await unsafeRepository.save(entity);

      expect(result).to.be.undefined();
    });
  });

  /*------------- HELPERS ---------------*/

  @model()
  class Customer extends Entity {
    @property({id: true})
    id: number;

    @property({required: true})
    name: string;

    @property()
    age?: number;
  }

  function givenUnsafeCustomerRepository() {
    const db = new juggler.DataSource({connector: 'memory'});
    defaultRepo = new DefaultCrudRepository(Customer, db);
    unsafeRepository = new UncheckedCrudRepositoryImpl(defaultRepo);
  }

  function givenCustomer(data?: Partial<Customer>) {
    return new Customer(Object.assign({name: 'a-customer'}, data));
  }
});
