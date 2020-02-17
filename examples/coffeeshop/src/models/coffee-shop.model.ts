import {Entity, hasMany, model, property} from '@loopback/repository';
import {Review, ReviewWithRelations} from './review.model';
import {Reviewer, ReviewerWithRelations} from './reviewer.model';

@model()
export class CoffeeShop extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  city?: string;

  @hasMany(() => Reviewer)
  reviewers: Reviewer[];

  @hasMany(() => Review)
  reviews: Review[];

  constructor(data?: Partial<CoffeeShop>) {
    super(data);
  }
}

export interface CoffeeShopRelations {
  reviewers?: ReviewerWithRelations[];
  reviews?: ReviewWithRelations[];
}

export type CoffeeShopWithRelations = CoffeeShop & CoffeeShopRelations;
