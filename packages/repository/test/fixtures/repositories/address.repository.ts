// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  juggler,
  repository,
} from '../../..';
import {Customer, Address} from '../models';
import {CustomerRepository} from '../repositories';

export class AddressRepository extends DefaultCrudRepository<
  Address,
  typeof Address.prototype.zipcode
> {
  public readonly customer: BelongsToAccessor<
    Customer,
    typeof Address.prototype.zipcode
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('CustomerRepository')
    customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Address, db);
    this.customer = this._createBelongsToAccessorFor(
      'customerId',
      customerRepositoryGetter,
    );
  }
}
