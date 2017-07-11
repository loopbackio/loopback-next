import {Repository} from '@loopback/data';

export const TODO_REPO = 'repositories.todo';
export class TodoRepo {
  name = TODO_REPO;
  value() {
    return new Repository();
  }
}

export const todoRepo = () => {
  return inject(TODO_REPO);
}