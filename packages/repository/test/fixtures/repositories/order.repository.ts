// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Order, Customer} from '../models';
import {CustomerRepository} from '../repositories';
import {
  DefaultCrudRepository,
  juggler,
  BelongsToFactory,
  repository,
} from '../../..';
import {inject, Getter} from '@loopback/context';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public customer: BelongsToFactory<Customer, typeof Order.prototype.id>;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('repositories.CustomerRepository')
    customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Order, db);
    this.customer = this._createBelongsToRepositoryFactoryFor(
      'customerId',
      customerRepositoryGetter,
    );
  }
}
