import {DefaultCrudRepository} from '@loopback/repository';
import {NoKey} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NoKeyRepository extends DefaultCrudRepository<
  NoKey,
  typeof NoKey.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(NoKey, dataSource);
  }
}
