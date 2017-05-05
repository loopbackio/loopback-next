import {Options} from '../../lib/common';
import {Where} from '../../lib/query';

import {EntityCrudRepository, CrudRepositoryImpl} from '../../lib/repository';
import {Customer} from '../models/customer';

export class CustomerRepository extends CrudRepositoryImpl<Customer, string> {
  constructor(connector: any, model: Customer) {
    super(connector, Customer);
  }

  deleteAll(where?: Where, options?: Options) {
    return Promise.reject(new Error('deleteAll is disabled'));
  }
};
