import {DefaultCrudRepository} from '@loopback/repository';
import {Defaultmodel} from '../models';
import {DbmemDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DefaultmodelRepository extends DefaultCrudRepository<
  Defaultmodel,
  typeof Defaultmodel.prototype.id
> {
  constructor(@inject('datasources.dbmem') dataSource: DbmemDataSource) {
    super(Defaultmodel, dataSource);
  }
}
