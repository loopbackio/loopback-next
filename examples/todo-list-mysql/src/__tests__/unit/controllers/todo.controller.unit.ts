// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-list-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {TodoController} from '../../../controllers';
import {Todo} from '../../../models';
import {TodoRepository} from '../../../repositories';
import {givenTodo} from '../../helpers';

describe('TodoController', () => {
  let todoRepo: StubbedInstanceWithSinonAccessor<TodoRepository>;

  /*
  =============================================================================
  TEST VARIABLES
  Combining top-level objects with our resetRepositories method means we don't
  need to duplicate several variable assignments (and generation statements)
  in all of our test logic.

  NOTE: If you wanted to parallelize your test runs, you should avoid this
  pattern since each of these tests is sharing references.
  =============================================================================
  */
  let controller: TodoController;
  let aTodo: Todo;
  let aTodoWithId: Todo;
  let aChangedTodo: Todo;
  let aListOfTodos: Todo[];

  beforeEach(resetRepositories);

  describe('createTodo', () => {
    it('creates a Todo', async () => {
      const create = todoRepo.stubs.create;
      create.resolves(aTodoWithId);
      const result = await controller.create(aTodo);
      expect(result).to.eql(aTodoWithId);
      sinon.assert.calledWith(create, aTodo);
    });
  });

  describe('findTodoById', () => {
    it('returns a todo if it exists', async () => {
      const findById = todoRepo.stubs.findById;
      findById.resolves(aTodoWithId);
      expect(await controller.findById(aTodoWithId.id as number)).to.eql(
        aTodoWithId,
      );
      sinon.assert.calledWith(findById, aTodoWithId.id);
    });
  });

  describe('findTodos', () => {
    it('returns multiple todos if they exist', async () => {
      const find = todoRepo.stubs.find;
      find.resolves(aListOfTodos);
      expect(await controller.find()).to.eql(aListOfTodos);
      sinon.assert.called(find);
    });

    it('returns empty list if no todos exist', async () => {
      const find = todoRepo.stubs.find;
      const expected: Todo[] = [];
      find.resolves(expected);
      expect(await controller.find()).to.eql(expected);
      sinon.assert.called(find);
    });
  });

  describe('replaceTodo', () => {
    it('successfully replaces existing items', async () => {
      const replaceById = todoRepo.stubs.replaceById;
      replaceById.resolves();
      await controller.replaceById(aTodoWithId.id as number, aChangedTodo);
      sinon.assert.calledWith(replaceById, aTodoWithId.id, aChangedTodo);
    });
  });

  describe('updateTodo', () => {
    it('successfully updates existing items', async () => {
      const updateById = todoRepo.stubs.updateById;
      updateById.resolves();
      await controller.updateById(aTodoWithId.id as number, aChangedTodo);
      sinon.assert.calledWith(updateById, aTodoWithId.id, aChangedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('successfully deletes existing items', async () => {
      const deleteById = todoRepo.stubs.deleteById;
      deleteById.resolves();
      await controller.deleteById(aTodoWithId.id as number);
      sinon.assert.calledWith(deleteById, aTodoWithId.id);
    });
  });

  function resetRepositories() {
    todoRepo = createStubInstance(TodoRepository);
    aTodo = givenTodo();
    aTodoWithId = givenTodo({
      id: 1,
    });
    aListOfTodos = [
      aTodoWithId,
      givenTodo({
        id: 2,
        title: 'so many things to do',
      }),
    ] as Todo[];
    aChangedTodo = givenTodo({
      id: aTodoWithId.id,
      title: 'Do some important things',
    });

    controller = new TodoController(todoRepo);
  }
});
