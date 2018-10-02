// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {TodoListController} from '../../../src/controllers';
import {TodoList} from '../../../src/models';
import {TodoListRepository} from '../../../src/repositories';
import {givenTodoList} from '../../helpers';

describe('TodoController', () => {
  let todoListRepo: StubbedInstanceWithSinonAccessor<TodoListRepository>;

  /*
  =============================================================================
  METHOD STUBS
  These handles give us a quick way to fake the response of our repository
  without needing to wrangle fake repository objects or manage real ones
  in our tests themselves.
  =============================================================================
   */
  let create: sinon.SinonStub;
  let count: sinon.SinonStub;
  let find: sinon.SinonStub;
  let updateAll: sinon.SinonStub;
  let findById: sinon.SinonStub;
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
  let controller: TodoListController;
  let aTodoList: TodoList;
  let aTodoListWithId: TodoList;
  let aTodoListToPatchTo: TodoList;
  let aChangedTodoList: TodoList;
  let aListOfTodoLists: TodoList[];

  beforeEach(resetRepositories);

  describe('create()', () => {
    it('creates a TodoList', async () => {
      create.resolves(aTodoListWithId);
      expect(await controller.create(aTodoList)).to.eql(aTodoListWithId);
      sinon.assert.calledWith(create, aTodoList);
    });
  });

  describe('count()', () => {
    it('returns the number of existing todoLists', async () => {
      count.resolves(aListOfTodoLists.length);
      expect(await controller.count()).to.eql(aListOfTodoLists.length);
      sinon.assert.called(count);
    });
  });

  describe('find()', () => {
    it('returns multiple todos if they exist', async () => {
      find.resolves(aListOfTodoLists);
      expect(await controller.find()).to.eql(aListOfTodoLists);
      sinon.assert.called(find);
    });

    it('returns empty list if no todos exist', async () => {
      const expected: TodoList[] = [];
      find.resolves(expected);
      expect(await controller.find()).to.eql(expected);
      sinon.assert.called(find);
    });
  });

  describe('updateAll()', () => {
    it('returns a number of todos updated', async () => {
      updateAll.resolves([aChangedTodoList].length);
      const where = {title: aTodoListWithId.title};
      expect(await controller.updateAll(aTodoListToPatchTo, where)).to.eql(1);
      sinon.assert.calledWith(updateAll, aTodoListToPatchTo, where);
    });
  });

  describe('findById()', () => {
    it('returns a todo if it exists', async () => {
      findById.resolves(aTodoListWithId);
      expect(await controller.findById(aTodoListWithId.id as number)).to.eql(
        aTodoListWithId,
      );
      sinon.assert.calledWith(findById, aTodoListWithId.id);
    });
  });

  describe('updateById', () => {
    it('successfully updates existing items', async () => {
      updateById.resolves();
      await controller.updateById(
        aTodoListWithId.id as number,
        aTodoListToPatchTo,
      );
      sinon.assert.calledWith(
        updateById,
        aTodoListWithId.id,
        aTodoListToPatchTo,
      );
    });
  });

  describe('deleteById', () => {
    it('successfully deletes existing items', async () => {
      deleteById.resolves();
      await controller.deleteById(aTodoListWithId.id as number);
      sinon.assert.calledWith(deleteById, aTodoListWithId.id);
    });
  });

  function resetRepositories() {
    todoListRepo = createStubInstance(TodoListRepository);
    aTodoList = givenTodoList();
    aTodoListWithId = givenTodoList({
      id: 1,
    });
    aListOfTodoLists = [
      aTodoListWithId,
      givenTodoList({
        id: 2,
        title: 'a lot of todos',
      }),
    ] as TodoList[];
    aTodoListToPatchTo = givenTodoList({
      title: 'changed list of todos',
    });
    aChangedTodoList = givenTodoList({
      id: aTodoListWithId.id,
      title: aTodoListToPatchTo.title,
    });

    // Setup CRUD fakes
    ({
      create,
      count,
      find,
      updateAll,
      findById,
      updateById,
      deleteById,
    } = todoListRepo.stubs);

    controller = new TodoListController(todoListRepo);
  }
});
