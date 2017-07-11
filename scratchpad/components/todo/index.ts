import {TodoController} from './controllers/TodoController.ts';
import {WebController} from './controllers/WebController.ts';
import {TodoRepo} from './bindings/TodoRepo.ts';
import {TodoRepo} from './bindings/AuthStrategy.ts';
import {Role} from './bindings/Role.ts';

export class Todo {
  controllers = [TodoController, WebController];
  bindings = [TodoRepo, AuthStrategy, Role];
}