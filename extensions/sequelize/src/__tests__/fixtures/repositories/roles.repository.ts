import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Roles, RolesRelations} from '../models';

export class RolesRepository extends SequelizeCrudRepository<
  Roles,
  typeof Roles.prototype.id,
  RolesRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(Roles, dataSource);
  }
}
