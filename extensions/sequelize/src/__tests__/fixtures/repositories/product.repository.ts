import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {SecondaryDataSource} from '../datasources/secondary.datasource';
import {Product, ProductRelations} from '../models';

export class ProductRepository extends SequelizeCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  constructor(
    @inject('datasources.secondary') dataSource: SecondaryDataSource,
  ) {
    super(Product, dataSource);
  }
}
