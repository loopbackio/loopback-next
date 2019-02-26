// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Count,
  DefaultHasManyRepository,
  HasManyRepository,
} from '@loopback/repository';
import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {TodoListTodoController} from '../../../controllers';
import {Todo, TodoList} from '../../../models';
import {TodoListRepository} from '../../../repositories';
import {givenTodo, givenTodoList} from '../../helpers';

describe('TodoController', () => {
  let todoListRepo: StubbedInstanceWithSinonAccessor<TodoListRepository>;
  let constrainedTodoRepo: StubbedInstanceWithSinonAccessor<
    HasManyRepository<Todo>
  >;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /*
  =============================================================================
  REPOSITORY FACTORY STUB
  This handle give us a quick way to fake the response of our repository
  without needing to wrangle fake repository objects or manage real ones
  in our tests themselves.
  =============================================================================
   */
  let todos: sinon.SinonStub<any[], Todo[]>;

  /*
  =============================================================================
  METHOD STUBS
  These handles give us a quick way to fake the response of our repository
  without needing to wrangle fake repository objects or manage real ones
  in our tests themselves.
  =============================================================================
   */
  let create: sinon.SinonStub<any[], Promise<Todo>>;
  let find: sinon.SinonStub<any[], Promise<Todo[]>>;
  let patch: sinon.SinonStub<any[], Promise<Count>>;
  let del: sinon.SinonStub<any[], Promise<Count>>;
  /* eslint-enable @typescript-eslint/no-explicit-any */

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
  let controller: TodoListTodoController;
  let aTodoListWithId: TodoList;
  let aTodo: Todo;
  let aTodoWithId: Todo;
  let aListOfTodos: Todo[];
  let aTodoToPatchTo: Todo;
  let aChangedTodo: Todo;

  beforeEach(resetRepositories);

  describe('create()', () => {
    it('creates a todo on a todoList', async () => {
      create.resolves(aTodoWithId);
      expect(await controller.create(aTodoListWithId.id!, aTodo)).to.eql(
        aTodoWithId,
      );
      sinon.assert.calledWith(todos, aTodoListWithId.id!);
      sinon.assert.calledWith(create, aTodo);
    });
  });

  describe('find()', () => {
    it('returns multiple todos if they exist', async () => {
      find.resolves(aListOfTodos);
      expect(await controller.find(aTodoListWithId.id!)).to.eql(aListOfTodos);
      sinon.assert.calledWith(todos, aTodoListWithId.id!);
      sinon.assert.called(find);
    });

    it('returns empty list if no todos exist', async () => {
      const expected: Todo[] = [];
      find.resolves(expected);
      expect(await controller.find(aTodoListWithId.id!)).to.eql(expected);
      sinon.assert.calledWith(todos, aTodoListWithId.id!);
      sinon.assert.called(find);
    });
  });

  describe('patch()', () => {
    it('returns a number of todos updated', async () => {
      patch.resolves({count: [aChangedTodo].length});
      const where = {title: aTodoWithId.title};
      expect(
        await controller.patch(aTodoListWithId.id!, aTodoToPatchTo, where),
      ).to.eql({count: 1});
      sinon.assert.calledWith(todos, aTodoListWithId.id!);
      sinon.assert.calledWith(patch, aTodoToPatchTo, where);
    });
  });

  describe('deleteAll()', () => {
    it('returns a number of todos deleted', async () => {
      del.resolves({count: aListOfTodos.length});
      expect(await controller.delete(aTodoListWithId.id!)).to.eql({
        count: aListOfTodos.length,
      });
      sinon.assert.calledWith(todos, aTodoListWithId.id!);
      sinon.assert.called(del);
    });
  });

  function resetRepositories() {
    todoListRepo = createStubInstance(TodoListRepository);
    constrainedTodoRepo = createStubInstance<HasManyRepository<Todo>>(
      DefaultHasManyRepository,
    );

    aTodoListWithId = givenTodoList({
      id: 1,
    });

    aTodo = givenTodo();
    aTodoWithId = givenTodo({id: 1});
    aListOfTodos = [
      aTodoWithId,
      givenTodo({
        id: 2,
        title: 'do another thing',
      }),
    ] as Todo[];
    aTodoToPatchTo = givenTodo({
      title: 'revised thing to do',
    });
    aChangedTodo = givenTodo({
      id: aTodoWithId.id,
      title: aTodoToPatchTo.title,
    });

    todos = sinon
      .stub()
      .withArgs(aTodoListWithId.id!)
      .returns(constrainedTodoRepo);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoListRepo as any).todos = todos;

    // Setup CRUD fakes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({create, find, patch, delete: del} = constrainedTodoRepo.stubs as any);

    controller = new TodoListTodoController(todoListRepo);
  }
});
