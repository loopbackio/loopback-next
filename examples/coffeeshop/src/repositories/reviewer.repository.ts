import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Reviewer, ReviewerRelations} from '../models';

export class ReviewerRepository extends DefaultCrudRepository<
  Reviewer,
  typeof Reviewer.prototype.id,
  ReviewerRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Reviewer, dataSource);
  }
}
