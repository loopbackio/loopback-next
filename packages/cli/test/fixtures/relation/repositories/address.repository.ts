import {DefaultCrudRepository, BelongsToAccessor} from '@loopback/repository';
import {Address, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AddressRepository extends DefaultCrudRepository<
  Address,
  typeof Address.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Address.prototype.id
  >;
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Address, dataSource);
  }
}
