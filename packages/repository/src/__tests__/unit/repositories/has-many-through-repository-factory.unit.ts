// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {createStubInstance, expect} from '@loopback/testlab';
import {
  createHasManyThroughRepositoryFactory,
  DefaultCrudRepository,
  Entity,
  HasManyThroughDefinition,
  juggler,
  ModelDefinition,
  RelationType,
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
        Getter.fromValue(orderRepo),
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
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with a target that is not a type resolver', () => {
    const relationMeta = givenHasManyThroughDefinition({
      // cast to any to disable compile check - we want to verify runtime assertion
      target: (Customer as unknown) as TypeResolver<Customer, typeof Customer>,
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with through.keyFrom pointing to an unknown property', () => {
    const relationMeta = givenHasManyThroughDefinition({
      // Let the relation to use the default keyTo value "companyId"
      // which does not exist on the Order model!
      through: {
        model: () => Order,
        keyFrom: undefined,
        keyTo: 'customerId',
      },
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/through model Order is missing.*foreign key companyId/);
  });

  it('rejects relations with through.keyTo pointing to an unknown property', () => {
    const relationMeta = givenHasManyThroughDefinition({
      through: {
        model: () => Order,
        keyFrom: 'sellerId',
        keyTo: 'not-existing',
      },
    });

    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/through model Order is missing.*foreign key not-existing/);
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
    ).to.throw(/through must be specified/);
  });

  it('rejects relations with "through model" that is not a type resolver', () => {
    const relationMeta = givenHasManyThroughDefinition();
    relationMeta.through.model = (true as unknown) as TypeResolver<
      Entity,
      typeof Entity
    >;
    expect(() =>
      createHasManyThroughRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
        Getter.fromValue(orderRepo),
      ),
    ).to.throw(/through\.model must be a type resolver/);
  });

  /*------------- HELPERS ---------------*/

  class Customer extends Entity {
    static definition = new ModelDefinition('Customer').addProperty('id', {
      type: Number,
      id: true,
    });
    id: number;
  }

  class Company extends Entity {
    static definition = new ModelDefinition('Company').addProperty('id', {
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
      })
      .addProperty('sellerId', {
        type: Number,
      });
    id: number;
    customerId: number;
    companyId: number;
  }

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Customer, dataSource);
    }
  }

  /*
  class CompanyRepository extends DefaultCrudRepository<
    Company,
    typeof Company.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Company, dataSource);
    }
  }
  */

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
    const defaults: HasManyThroughDefinition = {
      type: RelationType.hasMany,
      targetsMany: true,
      name: 'customers',
      source: Company,
      target: () => Customer,
      through: {
        model: () => Order,
        keyFrom: 'sellerId',
        keyTo: 'customerId',
      },
    };

    return Object.assign(defaults, props);
  }
});
