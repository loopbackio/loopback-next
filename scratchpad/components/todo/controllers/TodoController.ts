import {authenticate, authenticatedUser} from '@loopback/authentication';
import {role} from '@loopback/authorization';
import {todoRepo} from '../bindings/TodoRepo.ts';
import {get} from '@loopback/core';

export class TodoController {
  constructor(
    private @authenticatedUser() user,
    private @todoRepo() todos
  ) {}

  @authenticate()
  @get('/my/todos')
  getMyTodos() {
    return this.todos.findById(this.user);
  }

  @role('admin')
  @get('/all/todos')
  getAllTodos() {
    return this.todos.find();
  }
}