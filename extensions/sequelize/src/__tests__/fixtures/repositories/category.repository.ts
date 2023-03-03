import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Category, CategoryRelations} from '../models/index';

export class CategoryRepository extends SequelizeCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(Category, dataSource);
  }
}
