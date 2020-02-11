// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';
import {Geocoder} from '../services';

export class TodoController {
  constructor(
    @repository(TodoRepository) protected todoRepository: TodoRepository,
    @inject('services.Geocoder') protected geoService: Geocoder,
  ) {}

  async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    if (todo.remindAtAddress) {
      // TODO(bajtos) handle "address not found"
      const geo = await this.geoService.geocode(todo.remindAtAddress);
      // Encode the coordinates as "lat,lng" (Google Maps API format). See also
      // https://stackoverflow.com/q/7309121/69868
      // https://gis.stackexchange.com/q/7379
      todo.remindAtGeo = `${geo[0].y},${geo[0].x}`;
    }
    return this.todoRepository.create(todo);
  }

  async findTodoById(id: number, items?: boolean): Promise<Todo> {
    return this.todoRepository.findById(id);
  }

  async findTodos(filter?: Filter<Todo>): Promise<Todo[]> {
    return this.todoRepository.find(filter);
  }

  async replaceTodo(id: number, todo: Todo): Promise<void> {
    await this.todoRepository.replaceById(id, todo);
  }

  async updateTodo(id: number, todo: Partial<Todo>): Promise<void> {
    await this.todoRepository.updateById(id, todo);
  }

  async deleteTodo(id: number): Promise<void> {
    await this.todoRepository.deleteById(id);
  }
}
