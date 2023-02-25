import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {Category, CategoryRelations} from '../models/index';

export class CategoryRepository extends SequelizeCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Category, dataSource);
  }
}
