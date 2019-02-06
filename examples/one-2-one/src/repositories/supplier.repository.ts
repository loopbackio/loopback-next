import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  juggler,
  repository,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import {Supplier, Account} from '../models';
import {AccountRepository} from './account.repository';

export class SupplierRepository extends DefaultCrudRepository<
  Supplier,
  typeof Supplier.prototype.id
> {
  public readonly accounts: HasOneRepositoryFactory<
    Account,
    typeof Supplier.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('AccountRepository')
    protected accountRepositoryGetter: Getter<AccountRepository>,
  ) {
    super(Supplier, dataSource);
    this.accounts = this._createHasOneRepositoryFactoryFor(
      'accounts',
      accountRepositoryGetter,
    );
  }
}
