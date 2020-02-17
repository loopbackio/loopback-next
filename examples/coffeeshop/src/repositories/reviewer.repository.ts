import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Review, Reviewer, ReviewerRelations} from '../models';
import {ReviewRepository} from './review.repository';

export class ReviewerRepository extends DefaultCrudRepository<
  Reviewer,
  typeof Reviewer.prototype.id,
  ReviewerRelations
> {
  public readonly reviews: HasManyRepositoryFactory<
    Review,
    typeof Reviewer.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ReviewRepository')
    protected reviewRepositoryGetter: Getter<ReviewRepository>,
  ) {
    super(Reviewer, dataSource);
    this.reviews = this.createHasManyRepositoryFactoryFor(
      'reviews',
      reviewRepositoryGetter,
    );
    this.registerInclusionResolver('reviews', this.reviews.inclusionResolver);
  }
}
