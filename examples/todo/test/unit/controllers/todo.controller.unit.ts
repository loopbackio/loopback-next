// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, sinon} from '@loopback/testlab';
import {TodoController} from '../../../src/controllers';
import {TodoRepository} from '../../../src/repositories';
import {Todo} from '../../../src/models/index';
import {givenTodo} from '../../helpers';

describe('TodoController', () => {
  let todoRepo: TodoRepository;

  /*
  =============================================================================
  METHOD STUBS
  These handles give us a quick way to fake the response of our repository
  without needing to wrangle fake repository objects or manage real ones
  in our tests themselves.
  =============================================================================
   */
  let create: sinon.SinonStub;
  let findById: sinon.SinonStub;
  let find: sinon.SinonStub;
  let replaceById: sinon.SinonStub;
  let updateById: sinon.SinonStub;
  let deleteById: sinon.SinonStub;

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
  let aTodoList: Todo[];

  const noError = 'No error was thrown!';

  beforeEach(resetRepositories);
  describe('createTodo', () => {
    it('creates a Todo', async () => {
      create.resolves(aTodoWithId);
      const result = await controller.createTodo(aTodo);
      expect(result).to.eql(aTodoWithId);
      sinon.assert.calledWith(create, aTodo);
    });

    it('throws if the payload is missing a title', async () => {
      const todo = givenTodo();
      delete todo.title;
      try {
        await controller.createTodo(todo);
      } catch (err) {
        expect(err).to.match(/title is required/);
        sinon.assert.notCalled(create);
        return;
      }
      // Repository stub should not have been called!
      throw new Error(noError);
    });
  });

  describe('findTodoById', () => {
    it('returns a todo if it exists', async () => {
      findById.resolves(aTodoWithId);
      expect(await controller.findTodoById(aTodoWithId.id as number)).to.eql(
        aTodoWithId,
      );
      sinon.assert.calledWith(findById, aTodoWithId.id);
    });
  });

  describe('findTodos', () => {
    it('returns multiple todos if they exist', async () => {
      find.resolves(aTodoList);
      expect(await controller.findTodos()).to.eql(aTodoList);
      sinon.assert.called(find);
    });

    it('returns empty list if no todos exist', async () => {
      const expected: Todo[] = [];
      find.resolves(expected);
      expect(await controller.findTodos()).to.eql(expected);
      sinon.assert.called(find);
    });
  });

  describe('replaceTodo', () => {
    it('successfully replaces existing items', async () => {
      replaceById.resolves(true);
      expect(
        await controller.replaceTodo(aTodoWithId.id as number, aChangedTodo),
      ).to.eql(true);
      sinon.assert.calledWith(replaceById, aTodoWithId.id, aChangedTodo);
    });
  });

  describe('updateTodo', () => {
    it('successfully updates existing items', async () => {
      updateById.resolves(true);
      expect(
        await controller.updateTodo(aTodoWithId.id as number, aChangedTodo),
      ).to.eql(true);
      sinon.assert.calledWith(updateById, aTodoWithId.id, aChangedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('successfully deletes existing items', async () => {
      deleteById.resolves(true);
      expect(await controller.deleteTodo(aTodoWithId.id as number)).to.eql(
        true,
      );
      sinon.assert.calledWith(deleteById, aTodoWithId.id);
    });
  });

  function resetRepositories() {
    todoRepo = sinon.createStubInstance(TodoRepository);
    aTodo = givenTodo();
    aTodoWithId = givenTodo({
      id: 1,
    });
    aTodoList = [
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

    // Setup CRUD fakes
    create = todoRepo.create as sinon.SinonStub;
    findById = todoRepo.findById as sinon.SinonStub;
    find = todoRepo.find as sinon.SinonStub;
    updateById = todoRepo.updateById as sinon.SinonStub;
    replaceById = todoRepo.replaceById as sinon.SinonStub;
    deleteById = todoRepo.deleteById as sinon.SinonStub;
    controller = new TodoController(todoRepo);
  }
});
