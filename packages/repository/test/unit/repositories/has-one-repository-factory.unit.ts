// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {createStubInstance, expect} from '@loopback/testlab';
import {
  createHasOneRepositoryFactory,
  DefaultCrudRepository,
  Entity,
  HasOneDefinition,
  juggler,
  ModelDefinition,
  RelationType,
} from '../../..';

describe('createHasOneRepositoryFactory', () => {
  let customerRepo: CustomerRepository;

  beforeEach(givenStubbedCustomerRepo);

  it('rejects relations with missing source', () => {
    const relationMeta = givenHasOneDefinition({
      source: undefined,
    });

    expect(() =>
      createHasOneRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/source model must be defined/);
  });

  it('rejects relations with missing target', () => {
    const relationMeta = givenHasOneDefinition({
      target: undefined,
    });

    expect(() =>
      createHasOneRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with a target that is not a type resolver', () => {
    const relationMeta = givenHasOneDefinition({
      // tslint:disable-next-line:no-any
      target: Address as any,
      // the cast to any above is necessary to disable compile check
      // we want to verify runtime assertion
    });

    expect(() =>
      createHasOneRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with keyTo pointing to an unknown property', () => {
    const relationMeta = givenHasOneDefinition({
      target: () => Address,
      // Let the relation use the default keyTo value "customerId"
      // which does not exist on the Customer model!
      keyTo: undefined,
    });

    expect(() =>
      createHasOneRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target model Address is missing.*foreign key customerId/);
  });

  it('rejects relations with keyTo that is not an index', () => {
    const relationMeta = givenHasOneDefinition({
      name: 'order',
      target: () => ModelWithoutIndexFK,
    });

    expect(() =>
      createHasOneRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/foreign key customerId must be a unique index property/);
  });

  it('rejects relations with keyTo that is not a unique index', () => {
    const relationMeta = givenHasOneDefinition({
      name: 'profile',
      target: () => ModelWithoutUniqueIndexFK,
    });

    expect(() =>
      createHasOneRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/foreign key customerId must be a unique index property/);
  });

  /*------------- HELPERS ---------------*/

  class Address extends Entity {
    static definition = new ModelDefinition('Address')
      .addProperty('street', {
        type: 'string',
      })
      .addProperty('zipcode', {
        type: 'string',
      })
      .addProperty('city', {
        type: 'string',
      })
      .addProperty('province', {
        type: 'string',
      });
    street: String;
    zipcode: String;
    city: String;
    province: String;
  }

  class ModelWithoutIndexFK extends Entity {
    static definition = new ModelDefinition('ModelWithoutUniqueIndex')
      .addProperty('customerId', {
        type: 'string',
        index: false,
      })
      .addProperty('description', {
        type: 'string',
        required: true,
      })
      .addProperty('id', {
        type: 'number',
        id: true,
      })

      .addProperty('isShipped', {
        type: 'boolean',
        required: false,
      });
    id: number;
    customerId: string;
    description: string;
    isShipped: boolean;
  }

  class ModelWithoutUniqueIndexFK extends Entity {
    static definition = new ModelDefinition('ModelWithoutUniqueIndexFK')
      .addProperty('customerId', {
        type: 'string',
        index: {
          unique: false,
        },
      })
      .addProperty('description', {
        type: 'string',
        required: true,
      });

    customerId: string;
    description: string;
  }

  class Customer extends Entity {
    static definition = new ModelDefinition('Customer').addProperty('id', {
      type: Number,
      id: true,
    });
    id: number;
  }

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Customer, dataSource);
    }
  }

  function givenStubbedCustomerRepo() {
    customerRepo = createStubInstance(CustomerRepository);
  }

  function givenHasOneDefinition(
    props?: Partial<HasOneDefinition>,
  ): HasOneDefinition {
    const defaults: HasOneDefinition = {
      type: RelationType.hasOne,
      name: 'address',
      target: () => Address,
      source: Customer,
    };

    return Object.assign(defaults, props);
  }
});
