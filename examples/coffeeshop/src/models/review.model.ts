import {belongsTo, Entity, model, property} from '@loopback/repository';
import {CoffeeShop, CoffeeShopWithRelations} from './coffee-shop.model';
import {Reviewer, ReviewerWithRelations} from './reviewer.model';

@model()
export class Review extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  @property({
    type: 'date',
    required: true,
  })
  date: string;

  @property({
    type: 'number',
  })
  rating?: number;

  @property({
    type: 'string',
    required: true,
  })
  comments: string;

  @belongsTo(() => CoffeeShop)
  coffeeShopId: number;

  @belongsTo(() => Reviewer, {name: 'reviewer'})
  publisherId: number;

  constructor(data?: Partial<Review>) {
    super(data);
  }
}

export interface ReviewRelations {
  coffeeShop?: CoffeeShopWithRelations;
  publisher?: ReviewerWithRelations;
}

export type ReviewWithRelations = Review & ReviewRelations;
