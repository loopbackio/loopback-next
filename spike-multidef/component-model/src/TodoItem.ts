// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelRepositoryBase, DataAccessConnector} from 'model';

export class TodoItem {
  public title: string;
  public done: boolean;

  public constructor(data?: Partial<TodoItem>) {
    Object.assign(this, data);
  }

  public toObject(): Object {
    return Object.assign({}, this);
  }
}

export class TodoItemRepository extends ModelRepositoryBase<TodoItem> {
  public static create(connector: DataAccessConnector): TodoItemRepository {
    return new TodoItemRepository(TodoItem, TodoItem.name, connector);
  }
}
