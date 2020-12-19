// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';

@model()
export class Book extends Entity {
  constructor(data?: Partial<Book>) {
    super(data);
  }

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 10,
      minLength: 3,
      errorMessage: 'Name must be between 3 and 10 characters.',
    },
  })
  title: string;
}

export interface BookRelations {
  // describe navigational properties here
}

export type BookWithRelations = Book & BookRelations;
