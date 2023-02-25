import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Category} from './category.model';

@model()
export class Book extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'float',
      precision: 20,
      scale: 4,
    },
  })
  rating?: number;

  @belongsTo(() => Category)
  categoryId: number;

  constructor(data?: Partial<Book>) {
    super(data);
  }
}

export interface BookRelations {
  // describe navigational properties here
}

export type BookWithRelations = Book & BookRelations;
