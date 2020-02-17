import {Entity, hasMany, model, property} from '@loopback/repository';
import {Review, ReviewWithRelations} from './review.model';

@model()
/*TODO(derdeka) extends User */
export class Reviewer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  @property({
    type: 'number',
  })
  coffeeShopId?: number;

  @hasMany(() => Review, {keyTo: 'publisherId'})
  reviews: Review[];

  constructor(data?: Partial<Reviewer>) {
    super(data);
  }
}

export interface ReviewerRelations {
  reviews?: ReviewWithRelations[];
}

export type ReviewerWithRelations = Reviewer & ReviewerRelations;
