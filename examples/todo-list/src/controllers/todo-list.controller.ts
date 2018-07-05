// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, Where, repository} from '@loopback/repository';
import {post, param, get, patch, del, requestBody} from '@loopback/rest';
import {TodoList} from '../models';
import {TodoListRepository} from '../repositories';

export class TodoListController {
  constructor(
    @repository(TodoListRepository)
    public todoListRepository: TodoListRepository,
  ) {}

  @post('/todo-lists')
  async create(@requestBody() obj: TodoList): Promise<TodoList> {
    return await this.todoListRepository.create(obj);
  }

  @get('/todo-lists/count')
  async count(@param.query.string('where') where?: Where): Promise<number> {
    return await this.todoListRepository.count(where);
  }

  @get('/todo-lists')
  async find(
    @param.query.string('filter') filter?: Filter,
  ): Promise<TodoList[]> {
    return await this.todoListRepository.find(filter);
  }

  @patch('/todo-lists')
  async updateAll(
    @requestBody() obj: Partial<TodoList>,
    @param.query.string('where') where?: Where,
  ): Promise<number> {
    return await this.todoListRepository.updateAll(obj, where);
  }

  @del('/todo-lists')
  async deleteAll(@param.query.string('where') where?: Where): Promise<number> {
    return await this.todoListRepository.deleteAll(where);
  }

  @get('/todo-lists/{id}')
  async findById(@param.path.number('id') id: number): Promise<TodoList> {
    return await this.todoListRepository.findById(id);
  }

  @patch('/todo-lists/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() obj: TodoList,
  ): Promise<boolean> {
    return await this.todoListRepository.updateById(id, obj);
  }

  @del('/todo-lists/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoListRepository.deleteById(id);
  }
}
