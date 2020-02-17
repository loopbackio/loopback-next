import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {CoffeeShop, CoffeeShopRelations, Review, Reviewer} from '../models';
import {ReviewRepository} from './review.repository';
import {ReviewerRepository} from './reviewer.repository';

export class CoffeeShopRepository extends DefaultCrudRepository<
  CoffeeShop,
  typeof CoffeeShop.prototype.id,
  CoffeeShopRelations
> {
  public readonly reviewers: HasManyRepositoryFactory<
    Reviewer,
    typeof CoffeeShop.prototype.id
  >;

  public readonly reviews: HasManyRepositoryFactory<
    Review,
    typeof CoffeeShop.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ReviewerRepository')
    protected reviewerRepositoryGetter: Getter<ReviewerRepository>,
    @repository.getter('ReviewRepository')
    protected reviewRepositoryGetter: Getter<ReviewRepository>,
  ) {
    super(CoffeeShop, dataSource);
    this.reviews = this.createHasManyRepositoryFactoryFor(
      'reviews',
      reviewRepositoryGetter,
    );
    this.registerInclusionResolver('reviews', this.reviews.inclusionResolver);
    this.reviewers = this.createHasManyRepositoryFactoryFor(
      'reviewers',
      reviewerRepositoryGetter,
    );
    this.registerInclusionResolver(
      'reviewers',
      this.reviewers.inclusionResolver,
    );
  }
}
