import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {
  ProgrammingLanguage,
  ProgrammingLanguageRelations,
} from '../models/index';

export class ProgrammingLanguageRepository extends SequelizeCrudRepository<
  ProgrammingLanguage,
  typeof ProgrammingLanguage.prototype.id,
  ProgrammingLanguageRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(ProgrammingLanguage, dataSource);
  }
}
