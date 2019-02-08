// Copyright IBM Corp. 2017,2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {createStubInstance, expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  HasManyThroughDefinition,
  ModelDefinition,
  RelationType,
  createHasManyThroughRepositoryFactory,
  juggler,
} from '../../..';
import {TypeResolver} from '../../../type-resolver';

describe('createHasManyThroughRepositoryFactory', () => {
  let customerRepo: CustomerRepository;
  let orderRepo: OrderRepository;

  beforeEach(givenStubbedCustomerRepo);

  it('rejects relations with missing source', () => {
    const relationMeta = givenHasManyThroughDefinition({
      source: undefined,
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/source model must be defined/);
  });

  it('rejects relations with missing target', () => {
    const relationMeta = givenHasManyThroughDefinition({
      target: undefined,
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with a target that is not a type resolver', () => {
    const relationMeta = givenHasManyThroughDefinition({
      // tslint:disable-next-line:no-any
      target: (Customer as unknown) as TypeResolver<Customer, typeof Customer>,
      // the cast to any above is necessary to disable compile check
      // we want to verify runtime assertion
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with keyTo pointing to an unknown property', () => {
    const relationMeta = givenHasManyThroughDefinition({
      target: () => Customer,
      // Let the relation to use the default keyTo value "companyId"
      // which does not exist on the Customer model!
      keyTo: undefined,
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/through model Customer is missing.*foreign key companyId/);
  });

  it('rejects relations with missing "through"', () => {
    const relationMeta = givenHasManyThroughDefinition({
      target: () => Customer,
      through: undefined,
    });
    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/through must be a type resolver/);
  });

  it('rejects relations with "through" that is not a type resolver', () => {
    const relationMeta = givenHasManyThroughDefinition({
      target: () => Customer,
    });
    relationMeta.through = (true as unknown) as TypeResolver<
      Entity,
      typeof Entity
    >;
    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/through must be a type resolver/);
  });

  /*------------- HELPERS ---------------*/

  class Customer extends Entity {
    static definition = new ModelDefinition('Customer').addProperty('id', {
      type: Number,
      id: true,
    });
    id: number;
  }

  class Order extends Entity {
    static definition = new ModelDefinition('Order')
      .addProperty('id', {
        type: Number,
        id: true,
      })
      .addProperty('customerId', {
        type: Number,
      });
    id: number;
    customerId: number;
  }

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Customer, dataSource);
    }
  }

  class OrderRepository extends DefaultCrudRepository<
    Order,
    typeof Order.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Order, dataSource);
    }
  }

  function givenStubbedCustomerRepo() {
    customerRepo = createStubInstance(CustomerRepository);
  }

  function givenHasManyThroughDefinition(
    props?: Partial<HasManyThroughDefinition>,
  ): HasManyThroughDefinition {
    class Company extends Entity {
      static definition = new ModelDefinition('Company').addProperty('id', {
        type: Number,
        id: true,
      });
      id: number;
    }

    const defaults: HasManyThroughDefinition = {
      type: RelationType.hasMany,
      targetsMany: true,
      name: 'customers',
      target: () => Customer,
      through: () => Order,
      source: Company,
    };

    return Object.assign(defaults, props);
  }
});
