// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 relation checks generated source class repository answers {"relationType":"referencesMany","sourceModel":"Customer","destinationModel":"Account","relationName":"custom_name","registerInclusionResolver":false} generates Customer repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, ReferencesManyAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Account} from '../models';
import {AccountRepository} from './account.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {

  public readonly custom_name: ReferencesManyAccessor<Account, typeof Customer.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('AccountRepository') protected accountRepositoryGetter: Getter<AccountRepository>,) {
    super(Customer, dataSource);
    this.custom_name = this.createReferencesManyAccessorFor('custom_name', accountRepositoryGetter,);
  }
}

`;


exports[`lb4 relation checks generated source class repository answers {"relationType":"referencesMany","sourceModel":"Customer","destinationModel":"Account"} generates Customer repository file with different inputs 1`] = `
import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, ReferencesManyAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Account} from '../models';
import {AccountRepository} from './account.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {

  public readonly accounts: ReferencesManyAccessor<Account, typeof Customer.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('AccountRepository') protected accountRepositoryGetter: Getter<AccountRepository>,) {
    super(Customer, dataSource);
    this.accounts = this.createReferencesManyAccessorFor('accounts', accountRepositoryGetter,);
    this.registerInclusionResolver('accounts', this.accounts.inclusionResolver);
  }
}

`;


exports[`lb4 relation generates model relation for existing property name verifies that a preexisting property will be overwritten 1`] = `
import {Entity, model, property, referencesMany} from '@loopback/repository';
import {Account} from './account.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @referencesMany(() => Account)
  accountIds: number[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation generates model relation with custom relation name answers {"relationType":"referencesMany","sourceModel":"Customer","destinationModel":"Account","foreignKeyName":"accountIds","relationName":"my_accounts"} relation name should be my_accounts 1`] = `
import {Entity, model, property, referencesMany} from '@loopback/repository';
import {Account} from './account.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @referencesMany(() => Account, {name: 'my_accounts'})
  accountIds: number[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation generates model relation with default values answers {"relationType":"referencesMany","sourceModel":"Customer","destinationModel":"Account"} has correct default imports 1`] = `
import {Entity, model, property, referencesMany} from '@loopback/repository';
import {Account} from './account.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @referencesMany(() => Account)
  accountIds: number[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

`;


exports[`lb4 relation rejects relation when models does not exist 1`] = `
export * from './order-customer.controller';

`;
