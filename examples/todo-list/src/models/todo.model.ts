// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '@loopback/repository';
import {TodoList} from './todo-list.model';

@model({
  indexes: {
    /*==== Dummy demonstration of a model-level index definition ===*/
    demo: {
      properties: {desc: 'ASC'},
      mysql: {
        kind: 'FULLTEXT',
      },
    },
  },
  foreignKeys: {
    /*==== Dummy demonstration of a model-level foreign-key definition ===*/
    demo: {
      sourceProperties: ['todoListId'],
      targetModel: () => TodoList,
      targetProperties: ['id'],
      onDelete: 'CASCADE',
    },
  },
})
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    /*==== The title must be unique ====*/
    unique: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'boolean',
    /*==== Index this flag for faster lookup of completed todos ====*/
    index: true,
  })
  isComplete: boolean;

  @belongsTo(
    () => TodoList,
    {},
    {
      /*==== Define a foreign key to enforce referential integrity ===*/
      references: {
        model: () => TodoList,
        property: 'id',
        onDelete: 'CASCADE',
      },
    },
  )
  todoListId: number;

  getId() {
    return this.id;
  }

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}
