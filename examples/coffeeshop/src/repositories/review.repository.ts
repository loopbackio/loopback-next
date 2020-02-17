import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {CoffeeShop, Review, Reviewer, ReviewRelations} from '../models';
import {CoffeeShopRepository} from './coffee-shop.repository';
import {ReviewerRepository} from './reviewer.repository';

export class ReviewRepository extends DefaultCrudRepository<
  Review,
  typeof Review.prototype.id,
  ReviewRelations
> {
  public readonly coffeeShop: BelongsToAccessor<
    CoffeeShop,
    typeof Review.prototype.id
  >;

  public readonly reviewer: BelongsToAccessor<
    Reviewer,
    typeof Review.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('CoffeeShopRepository')
    protected coffeeShopRepositoryGetter: Getter<CoffeeShopRepository>,
    @repository.getter('ReviewerRepository')
    protected reviewerRepositoryGetter: Getter<ReviewerRepository>,
  ) {
    super(Review, dataSource);
    this.coffeeShop = this.createBelongsToAccessorFor(
      'coffeeShop',
      coffeeShopRepositoryGetter,
    );
    this.registerInclusionResolver(
      'coffeeShop',
      this.coffeeShop.inclusionResolver,
    );
    this.reviewer = this.createBelongsToAccessorFor(
      'reviewer',
      reviewerRepositoryGetter,
    );
    this.registerInclusionResolver('reviewer', this.reviewer.inclusionResolver);
  }
}
