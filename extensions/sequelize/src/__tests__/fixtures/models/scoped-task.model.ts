import {Entity, model, property} from '@loopback/repository';

/**
 * Simplified Entity used for testing settings "scope" functionality
 */
@model({
  settings: {
    scope: {
      limit: 1,
      where: {
        completed: false,
      },
    },
  },
})
export class ScopedTask extends Entity {
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
    type: 'boolean',
    default: false,
  })
  completed: boolean;

  constructor(data?: Partial<ScopedTask>) {
    super(data);
  }
}

export interface ScopedTaskRelations {
  // describe navigational properties here
}

export type ScopedTaskWithRelations = ScopedTask & ScopedTaskRelations;
