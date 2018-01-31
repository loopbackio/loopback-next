// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, inject} from '@loopback/core';
import {api} from '@loopback/rest';
import {def} from './todo-controller.api';
import {Todo} from '../models/todo';
import * as util from 'util';
import {EntityCrudRepository, repository} from '@loopback/repository';

@api(def)
export class TodoController {
  @repository(Todo, 'ds')
  repository: EntityCrudRepository<Todo, number>;

  constructor() {}

  async get(title?: string): Promise<Todo[]> {
    const filter = title ? {where: {title: title}} : {};
    return await this.repository.find(filter);
  }

  async getById(id: number): Promise<Todo[]> {
    return await this.repository.find({where: {id: id}});
  }

  async create(body: Object) {
    return await this.repository.create(new Todo(body));
  }

  async update(id: number, body: Object): Promise<AffectedItems> {
    let success: boolean;
    if (id) {
      const todo = new Todo(body);
      todo.id = id;
      success = await this.repository.updateById(id, todo);
      // FIXME(kev): Unhandled error is thrown if you attempt to return
      // the boolean value that the repository.update method returns.
      return Promise.resolve({count: success ? 1 : 0});
    } else if (body) {
      const result = await this.repository.updateAll(new Todo(body));
      return Promise.resolve({count: result});
    } else {
      return Promise.reject(
        new Error('Cowardly refusing to update all todos!'),
      );
    }
  }

  async replace(id: number, body: Todo): Promise<AffectedItems> {
    const success = await this.repository.replaceById(id, new Todo(body));
    // FIXME(kev): Unhandled error is thrown if you attempt to return
    // the boolean value that the repository.replaceById method returns.
    return Promise.resolve({count: success ? 1 : 0});
  }

  async delete(title: string): Promise<AffectedItems> {
    if (!title) {
      return Promise.reject(new Error('You must provide a filter query!'));
    }
    const filter = {where: {title: title}};
    const result = await this.repository.deleteAll(filter);
    return Promise.resolve({count: result});
  }

  async deleteById(id: number): Promise<AffectedItems> {
    const success = await this.repository.deleteById(id);
    // FIXME(kev): Unhandled error is thrown if you attempt to return
    // the boolean value that the repository.replaceById method returns.
    return Promise.resolve({count: success ? 1 : 0});
  }
}
/**
 * Helper class to define the return type of operations that return
 * affected item counts.
 *
 * @class AffectedItems
 */
class AffectedItems {
  constructor(public count: number) {}
}
