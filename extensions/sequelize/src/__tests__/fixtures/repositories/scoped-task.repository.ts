import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {ScopedTask, ScopedTaskRelations} from '../models/index';

/**
 * Simplified repository used for testing Model settings "scope" functionality
 */
export class ScopedTaskRepository extends SequelizeCrudRepository<
  ScopedTask,
  typeof ScopedTask.prototype.id,
  ScopedTaskRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(ScopedTask, dataSource);
  }

  protected getDefaultFnRegistry() {
    return {
      ...super.getDefaultFnRegistry(),
      customAlias: () => Math.random(),
    };
  }
}
