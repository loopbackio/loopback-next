import {DefaultCrudRepository} from '@loopback/repository';
import {DefaultModel} from '../models';
import {DbmemDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DefaultModelRepository extends DefaultCrudRepository<
  DefaultModel,
  typeof DefaultModel.prototype.id
> {
  constructor(@inject('datasources.dbmem') dataSource: DbmemDataSource) {
    super(DefaultModel, dataSource);
  }
}
