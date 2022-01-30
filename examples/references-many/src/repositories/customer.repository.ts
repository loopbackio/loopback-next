// Copyright IBM Corp. 2022. All Rights Reserved.
// Node module: @loopback/example-references-many
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  ReferencesManyAccessor,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Account, Customer, CustomerRelations} from '../models';
import {AccountRepository} from './account.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {
  public readonly accounts: ReferencesManyAccessor<
    Account,
    typeof Account.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('AccountRepository')
    protected accountRepositoryGetter: Getter<AccountRepository>,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Customer, dataSource);

    this.accounts = this.createReferencesManyAccessorFor(
      'accounts',
      accountRepositoryGetter,
    );

    this.registerInclusionResolver('accounts', this.accounts.inclusionResolver);
  }
}
