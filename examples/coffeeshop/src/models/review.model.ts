import {Entity, model, property} from '@loopback/repository';

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

  constructor(data?: Partial<Review>) {
    super(data);
  }
}

export interface ReviewRelations {
  // describe navigational properties here
}

export type ReviewWithRelations = Review & ReviewRelations;
