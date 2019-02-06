import {
  BelongsToAccessor,
  DefaultCrudRepository,
  juggler,
  repository,
} from '@loopback/repository';
import {Account, Supplier} from '../models';
import {Getter, inject} from '@loopback/core';
import {SupplierRepository} from './supplier.repository';

export class AccountRepository extends DefaultCrudRepository<
  Account,
  typeof Account.prototype.id
> {
  public readonly supplier: BelongsToAccessor<
    Supplier,
    typeof Account.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('SupplierRepository')
    protected supplierRepositoryGetter: Getter<SupplierRepository>,
  ) {
    super(Account, dataSource);
    this.supplier = this._createBelongsToAccessorFor(
      'supplier',
      supplierRepositoryGetter,
    );
  }
}
