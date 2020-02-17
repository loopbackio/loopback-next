import {Entity, model, property} from '@loopback/repository';

@model()
/*TODO(derdeka) extends User */
export class Reviewer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  constructor(data?: Partial<Reviewer>) {
    super(data);
  }
}

export interface ReviewerRelations {
  // describe navigational properties here
}

export type ReviewerWithRelations = Reviewer & ReviewerRelations;
