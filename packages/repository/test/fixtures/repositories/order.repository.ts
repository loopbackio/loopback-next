import {Order, Customer} from '../models';
import {CustomerRepository} from '../repositories';
import {DefaultCrudRepository, juggler, BelongsToFactory} from '../../..';
import {inject, Getter} from '@loopback/context';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public customer: BelongsToFactory<Customer, Order>;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @inject.getter('repositories.CustomerRepository')
    customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Order, db);
    this.customer = this._createBelongsToFactoryFor(
      'customerId',
      customerRepositoryGetter,
    );
  }
}
