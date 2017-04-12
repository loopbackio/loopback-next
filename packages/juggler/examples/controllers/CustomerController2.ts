import {EntityCrudRepository} from '../../lib/persistence';
import {Customer} from '../models/customer';
import {repository} from '../../lib/decorator';
/**
 * Controller for Customer
 */
// @controller
export class CustomerController2 {
  constructor(
    // Use constructor dependency injection
    @repository(Customer, 'mongodbDataSource')
    private repository: EntityCrudRepository<Customer, string>) {
  }
}