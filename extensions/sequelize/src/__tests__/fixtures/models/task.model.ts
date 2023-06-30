import {Entity, model, property} from '@loopback/repository';

@model()
export class Task extends Entity {
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
    type: 'string',
    defaultFn: 'uuid',
  })
  uuidv1: string;

  @property({
    type: 'string',
    defaultFn: 'uuidv4',
  })
  uuidv4: string;

  @property({
    type: 'string',
    defaultFn: 'shortid',
  })
  shortId: string;

  @property({
    type: 'string',
    defaultFn: 'nanoid',
  })
  nanoId: string;

  @property({
    type: 'number',
    defaultFn: 'customAlias',
  })
  customAlias: number;

  @property({
    type: Date,
    defaultFn: 'now',
  })
  createdAt: Date;

  constructor(data?: Partial<Task>) {
    super(data);
  }
}

export interface TaskRelations {
  // describe navigational properties here
}

export type TaskWithRelations = Task & TaskRelations;
