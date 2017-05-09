import {EntityCrudRepository} from '../../src/repository';
import {Customer} from '../models/customer';
import {repository} from '../../src/decorator';
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