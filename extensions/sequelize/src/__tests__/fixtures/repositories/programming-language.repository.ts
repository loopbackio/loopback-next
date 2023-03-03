import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {
  ProgrammingLanguage,
  ProgrammingLanguageRelations,
} from '../models/index';

export class ProgrammingLanguageRepository extends SequelizeCrudRepository<
  ProgrammingLanguage,
  typeof ProgrammingLanguage.prototype.id,
  ProgrammingLanguageRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(ProgrammingLanguage, dataSource);
  }
}
