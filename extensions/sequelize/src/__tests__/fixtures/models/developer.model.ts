import {Entity, model, property, referencesMany} from '@loopback/repository';
import {ProgrammingLanguage} from './programming-language.model';

@model()
export class Developer extends Entity {
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

  @referencesMany(
    () => ProgrammingLanguage,
    {},
    {
      type: ['string'],
      postgresql: {dataType: 'varchar[]'},
    },
  )
  programmingLanguageIds: number[];

  constructor(data?: Partial<Developer>) {
    super(data);
  }
}

export interface DeveloperRelations {
  // describe navigational properties here
}

export type DeveloperWithRelations = Developer & DeveloperRelations;
