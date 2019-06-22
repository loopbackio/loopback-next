// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {createStubInstance, expect} from '@loopback/testlab';
import {
  createHasManyRepositoryFactory,
  DefaultCrudRepository,
  Entity,
  HasManyDefinition,
  juggler,
  ModelDefinition,
  RelationType,
} from '../../..';

describe('createHasManyRepositoryFactory', () => {
  let customerRepo: CustomerRepository;

  beforeEach(givenStubbedCustomerRepo);

  it('rejects relations with missing source', () => {
    const relationMeta = givenHasManyDefinition({
      source: undefined,
    });

    expect(() =>
      createHasManyRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/source model must be defined/);
  });

  it('rejects relations with missing target', () => {
    const relationMeta = givenHasManyDefinition({
      target: undefined,
    });

    expect(() =>
      createHasManyRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with a target that is not a type resolver', () => {
    const relationMeta = givenHasManyDefinition({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target: Customer as any,
      // the cast to any above is necessary to disable compile check
      // we want to verify runtime assertion
    });

    expect(() =>
      createHasManyRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with keyTo pointing to an unknown property', () => {
    const relationMeta = givenHasManyDefinition({
      target: () => Customer,
      // Let the relation to use the default keyTo value "companyId"
      // which does not exist on the Customer model!
      keyTo: undefined,
    });

    expect(() =>
      createHasManyRepositoryFactory(
        relationMeta,
        Getter.fromValue(customerRepo),
      ),
    ).to.throw(/target model Customer is missing.*foreign key companyId/);
  });

  /*------------- HELPERS ---------------*/

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

  function givenHasManyDefinition(
    props?: Partial<HasManyDefinition>,
  ): HasManyDefinition {
    class Company extends Entity {
      static definition = new ModelDefinition('Company').addProperty('id', {
        type: Number,
        id: true,
      });
      id: number;
    }

    const defaults: HasManyDefinition = {
      type: RelationType.hasMany,
      targetsMany: true,
      name: 'customers',
      target: () => Customer,
      source: Company,
    };

    return Object.assign(defaults, props);
  }
});
