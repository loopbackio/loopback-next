import {Customer, Order} from '../models';
import {OrderRepository} from './order.repository';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
} from '../../..';
import {inject, Getter} from '@loopback/context';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  public orders: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @inject.getter('repositories.OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Customer, db);
    this.orders = this._createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
  }
}
