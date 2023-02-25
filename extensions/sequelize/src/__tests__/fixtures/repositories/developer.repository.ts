import {Getter, inject} from '@loopback/core';
import {ReferencesManyAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {
  Developer,
  DeveloperRelations,
  ProgrammingLanguage,
} from '../models/index';
import {ProgrammingLanguageRepository} from './programming-language.repository';

export class DeveloperRepository extends SequelizeCrudRepository<
  Developer,
  typeof Developer.prototype.id,
  DeveloperRelations
> {
  public readonly programmingLanguages: ReferencesManyAccessor<
    ProgrammingLanguage,
    typeof Developer.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ProgrammingLanguageRepository')
    protected programmingLanguageRepositoryGetter: Getter<ProgrammingLanguageRepository>,
  ) {
    super(Developer, dataSource);
    this.programmingLanguages = this.createReferencesManyAccessorFor(
      'programmingLanguages',
      programmingLanguageRepositoryGetter,
    );
    this.registerInclusionResolver(
      'programmingLanguages',
      this.programmingLanguages.inclusionResolver,
    );
  }
}
