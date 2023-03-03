import {Getter, inject} from '@loopback/core';
import {ReferencesManyAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
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
    @inject('datasources.primary') dataSource: PrimaryDataSource,
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
