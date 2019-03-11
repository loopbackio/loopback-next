// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter} from '@loopback/repository';
import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {TodoController} from '../../../controllers';
import {Todo} from '../../../models/index';
import {TodoRepository} from '../../../repositories';
import {GeocoderService} from '../../../services';
import {aLocation, givenTodo} from '../../helpers';

describe('TodoController', () => {
  let todoRepo: StubbedInstanceWithSinonAccessor<TodoRepository>;
  let geoService: GeocoderService;

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
  let geocode: sinon.SinonStub;

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
      create.resolves(aTodoWithId);
      const result = await controller.createTodo(aTodo);
      expect(result).to.eql(aTodoWithId);
      sinon.assert.calledWith(create, aTodo);
    });

    it('resolves remindAtAddress to a geocode', async () => {
      geocode.resolves([aLocation.geopoint]);

      const input = givenTodo({remindAtAddress: aLocation.address});

      const expected = new Todo(input);
      Object.assign(expected, {
        remindAtAddress: aLocation.address,
        remindAtGeo: aLocation.geostring,
      });
      create.resolves(expected);

      const result = await controller.createTodo(input);

      expect(result).to.eql(expected);
      sinon.assert.calledWith(create, input);
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
      find.resolves(aListOfTodos);
      expect(await controller.findTodos()).to.eql(aListOfTodos);
      sinon.assert.called(find);
    });

    it('returns empty list if no todos exist', async () => {
      const expected: Todo[] = [];
      find.resolves(expected);
      expect(await controller.findTodos()).to.eql(expected);
      sinon.assert.called(find);
    });

    it('uses the provided filter', async () => {
      const filter: Filter = {where: {isCompleted: false}};

      find.resolves(aListOfTodos);
      await controller.findTodos(filter);
      sinon.assert.calledWith(find, filter);
    });
  });

  describe('replaceTodo', () => {
    it('successfully replaces existing items', async () => {
      replaceById.resolves();
      await controller.replaceTodo(aTodoWithId.id as number, aChangedTodo);
      sinon.assert.calledWith(replaceById, aTodoWithId.id, aChangedTodo);
    });
  });

  describe('updateTodo', () => {
    it('successfully updates existing items', async () => {
      updateById.resolves();
      await controller.updateTodo(aTodoWithId.id as number, aChangedTodo);
      sinon.assert.calledWith(updateById, aTodoWithId.id, aChangedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('successfully deletes existing items', async () => {
      deleteById.resolves();
      await controller.deleteTodo(aTodoWithId.id as number);
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

    // Setup CRUD fakes
    ({
      create,
      findById,
      find,
      updateById,
      replaceById,
      deleteById,
    } = todoRepo.stubs);

    geoService = {geocode: sinon.stub()};
    geocode = geoService.geocode as sinon.SinonStub;

    controller = new TodoController(todoRepo, geoService);
  }
});
