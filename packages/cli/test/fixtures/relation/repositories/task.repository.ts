import {inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Task} from '../models';

export class TaskRepository extends DefaultCrudRepository<
  Task,
  typeof Task.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Task.prototype.id
  >;
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Task, dataSource);
  }
}
