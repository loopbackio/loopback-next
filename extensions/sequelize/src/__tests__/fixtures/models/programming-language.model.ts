import {Entity, model, property} from '@loopback/repository';

@model()
export class ProgrammingLanguage extends Entity {
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
  name: string;

  constructor(data?: Partial<ProgrammingLanguage>) {
    super(data);
  }
}

export interface ProgrammingLanguageRelations {
  // describe navigational properties here
}

export type ProgrammingLanguageWithRelations = ProgrammingLanguage &
  ProgrammingLanguageRelations;
