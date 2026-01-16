import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Friend1} from '../models';

export class Friend1Repository extends DefaultCrudRepository<
  Friend1,
  typeof Friend1.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Friend1, dataSource);
  }
}
