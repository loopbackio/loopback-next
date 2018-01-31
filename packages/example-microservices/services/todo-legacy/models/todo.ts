// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';

@model()
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true,
    description: 'The ID number of the Todo entry.',
  })
  id: number;

  @property({
    type: 'string',
    description: 'The title of the todo.',
  })
  title: string;

  @property({
    type: 'string',
    description: 'The main body of the todo.',
  })
  body: string;

  constructor(body?: Object) {
    super();
    if (body) {
      Object.assign(this, body);
    }
  }

  getId() {
    return this.id;
  }
}
