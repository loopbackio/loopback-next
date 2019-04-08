// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createStubInstance, expect} from '@loopback/testlab';
import {
  BelongsToDefinition,
  createBelongsToAccessor,
  DefaultCrudRepository,
  Entity,
  Getter,
  juggler,
  ModelDefinition,
  RelationType,
} from '../../..';

describe('createBelongsToAccessor', () => {
  let customerRepo: CustomerRepository;
  let companyRepo: CompanyRepository;

  beforeEach(givenStubbedCustomerRepo);
  beforeEach(givenStubbedCompanyRepo);

  it('rejects relations with missing source', () => {
    const relationMeta = givenBelongsToDefinition({
      source: undefined,
    });

    expect(() =>
      createBelongsToAccessor(
        relationMeta,
        Getter.fromValue(companyRepo),
        customerRepo,
      ),
    ).to.throw(/source model must be defined/);
  });

  it('rejects relations with missing target', () => {
    const relationMeta = givenBelongsToDefinition({
      target: undefined,
    });

    expect(() =>
      createBelongsToAccessor(
        relationMeta,
        Getter.fromValue(companyRepo),
        customerRepo,
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('rejects relations with missing keyFrom', () => {
    const relationMeta = givenBelongsToDefinition({
      keyFrom: undefined,
    });

    expect(() =>
      createBelongsToAccessor(
        relationMeta,
        Getter.fromValue(companyRepo),
        customerRepo,
      ),
    ).to.throw(/keyFrom is required/);
  });

  it('rejects relations with a target that is not a type resolver', () => {
    const relationMeta = givenBelongsToDefinition({
      // tslint:disable-next-line:no-any
      target: Customer as any,
      // the cast to any above is necessary to disable compile check
      // we want to verify runtime assertion
    });

    expect(() =>
      createBelongsToAccessor(
        relationMeta,
        Getter.fromValue(companyRepo),
        customerRepo,
      ),
    ).to.throw(/target must be a type resolver/);
  });

  it('throws an error when the target does not have any primary key', () => {
    class Product extends Entity {
      static definition = new ModelDefinition('Product').addProperty(
        'categoryId',
        {type: Number},
      );
    }

    class Category extends Entity {
      static definition = new ModelDefinition('Category');
    }

    const productRepo = createStubInstance(DefaultCrudRepository);
    const categoryRepo = createStubInstance(DefaultCrudRepository);

    const relationMeta: BelongsToDefinition = {
      type: RelationType.belongsTo,
      name: 'category',
      source: Product,
      target: () => Category,
      keyFrom: 'categoryId',
      // Let the relation to look up keyTo as the primary key of Category
      // (which is not defined!)
      keyTo: undefined,
    };

    expect(() =>
      createBelongsToAccessor(
        relationMeta,
        Getter.fromValue(categoryRepo),
        productRepo,
      ),
    ).to.throw(/Category does not have any primary key/);
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

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Customer, dataSource);
    }
  }

  class CompanyRepository extends DefaultCrudRepository<
    Company,
    typeof Company.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Company, dataSource);
    }
  }

  function givenStubbedCustomerRepo() {
    customerRepo = createStubInstance(CustomerRepository);
  }

  function givenStubbedCompanyRepo() {
    customerRepo = createStubInstance(CompanyRepository);
  }

  function givenBelongsToDefinition(
    props?: Partial<BelongsToDefinition>,
  ): BelongsToDefinition {
    const defaults: BelongsToDefinition = {
      type: RelationType.belongsTo,
      name: 'company',
      source: Company,
      target: () => Customer,
      keyFrom: 'customerId',
    };

    return Object.assign(defaults, props);
  }
});
