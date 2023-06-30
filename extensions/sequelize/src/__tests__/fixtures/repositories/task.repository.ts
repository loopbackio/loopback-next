import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Task, TaskRelations} from '../models/index';

export class TaskRepository extends SequelizeCrudRepository<
  Task,
  typeof Task.prototype.id,
  TaskRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(Task, dataSource);
  }

  protected getDefaultFnRegistry() {
    return {
      ...super.getDefaultFnRegistry(),
      customAlias: () => Math.random(),
    };
  }
}
