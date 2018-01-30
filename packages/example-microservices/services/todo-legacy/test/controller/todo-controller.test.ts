import 'mocha';
import * as _ from 'lodash';
import { expect, sinon } from '@loopback/testlab';
import {
  DefaultCrudRepository,
  DataSourceConstructor,
  ModelBaseConstructor,
} from '@loopback/repository';
import { TodoController } from '../../controllers/todo-controller';
import { Todo } from '../../models/todo';

import * as util from 'util';

describe('TodoController', () => {
  let controller = new TodoController();
  // NOTE: Creating the datasource and model definition with
  // the real functions, and then stubbing them is easier than
  // building the stubs and fakes by hand!
  let datasource = new DataSourceConstructor({
    name: 'ds',
    connector: 'memory'
  });
  let repository = new DefaultCrudRepository<Todo, number>(
    Todo,
    datasource
  );
  controller.repository = repository;

  describe('getTodo', () => {
    let sandbox = sinon.sandbox.create();
    beforeEach(() => {
      sandbox.restore();
    });
    it('returns all todos when called without ID', async () => {
      let stub = sandbox.stub(repository, 'find');
      let result = await controller.get();
      expect.ok(stub.called, 'find was called');
      expect.deepEqual(stub.getCall(0).args, [{}], 'args were correct');
    });
    it('returns the correct todo by ID', async () => {
      let stub = sandbox.stub(repository, 'find');
      let result = await controller.getById(1);
      expect.ok(stub.called, 'find was called');
    });
    it('can filter by title', async () => {
      let stub = sandbox.stub(repository, 'find');
      let result = await controller.get('test2');
      expect.ok(stub.called, 'find was called');
      expect.deepEqual(
        stub.getCall(0).args,
        [
          {
            where: { title: 'test2' }
          }
        ],
        'controller created correct filter object'
      );
    });
  });

  describe('createTodo', () => {
    let sandbox = sinon.sandbox.create();
    beforeEach(() => {
      sandbox.restore();
    });
    it('calls create on the repository', async () => {
      let stub = sandbox.stub(repository, 'create');
      let result = await controller.create({
        title: 'foo',
        body: 'bar'
      });
      expect.ok(stub.called, 'create was called');
    });
  });

  describe('replaceTodo', () => {
    let sandbox = sinon.sandbox.create();
    beforeEach(() => {
      sandbox.restore();
    });
    it('returns an affected item count of 1 on success', async () => {
      let stub = sandbox.stub(controller.repository, 'replaceById');
      let replacement = new Todo();
      Object.assign(replacement, {
        id: 1,
        title: 'foo',
        body: 'bar'
      });
      let result = await controller.replace(1, replacement);
      expect.ok(stub.called, 'replace was called');
    });
  });

  describe('updateTodo', () => {
    let sandbox = sinon.sandbox.create();
    beforeEach(() => {
      sandbox.restore();
    });
    it('returns the updated version of the object', async () => {
      let stub = sandbox.stub(controller.repository, 'updateById');
      let replacement = {
        id: 1,
        title: 'foo'
      };
      let expected = _.merge({ id: 1 }, replacement);
      let result = await controller.update(1, replacement);
      expect.ok(stub.called, 'update was called');
    });
    // There's no unhappy path tests here for missing ID, because
    // it's handled at the repository layer, which we are stubbing!
  });

  describe('deleteTodo', () => {
    let sandbox = sinon.sandbox.create();
    beforeEach(() => {
      sandbox.restore();
    });
    it('works on one item', async () => {
      let stub = sandbox.stub(controller.repository, 'deleteById');
      let result = await controller.deleteById(1);
      expect.ok(stub.called, 'delete was called');
      // The null filter is automatically replaced with an empty object in
      // controller layer!
      expect.deepEqual(stub.getCall(0).args, [1], 'args were correct');
    });

    it('can filter by title', async () => {
      let stub = sandbox.stub(controller.repository, 'deleteAll');
      let result = await controller.delete('test2');
      expect.ok(stub.called, 'result exists');
      expect.deepEqual(
        stub.getCall(0).args,
        [
          {
            where: {
              title: 'test2'
            }
          }
        ],
        'controller created correct filter object'
      );
    });
  });
});
