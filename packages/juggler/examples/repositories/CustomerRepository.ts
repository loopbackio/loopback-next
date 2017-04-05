import {EntityCrudRepository, CrudRepositoryImpl} from '../../lib/persistence';
import {Customer} from '../models/customer';

export class CustomerRepository extends CrudRepositoryImpl<Customer, string> {

};