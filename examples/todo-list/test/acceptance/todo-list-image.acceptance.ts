// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import {TodoListApplication} from '../../src/application';
import {TodoList, TodoListImage} from '../../src/models/';
import {
  TodoListRepository,
  TodoListImageRepository,
} from '../../src/repositories/';
import {givenTodoListImage, givenTodoList} from '../helpers';

describe('TodoListApplication', () => {
  let app: TodoListApplication;
  let client: Client;
  let todoListImageRepo: TodoListImageRepository;
  let todoListRepo: TodoListRepository;

  let persistedTodoList: TodoList;

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(givenTodoListImageRepository);
  before(givenTodoListRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await todoListImageRepo.deleteAll();
    await todoListRepo.deleteAll();
  });

  beforeEach(async () => {
    persistedTodoList = await givenTodoListInstance();
  });

  it('creates image for a todoList', async () => {
    const todoListImage = givenTodoListImage();
    delete todoListImage.todoListId;
    const response = await client
      .post(`/todo-lists/${persistedTodoList.id}/image`)
      .send(todoListImage)
      .expect(200);

    const expected = {...todoListImage, todoListId: persistedTodoList.id};
    expect(response.body).to.containEql(expected);

    const created = await todoListImageRepo.findById(response.body.id);
    expect(toJSON(created)).to.deepEqual({id: response.body.id, ...expected});
  });

  it('finds images for a todoList', async () => {
    const todoListImage = await givenTodoListImageInstanceOfTodoList(
      persistedTodoList.id,
      {
        value: 'A picture of a green checkmark',
      },
    );

    const response = await client
      .get(`/todo-lists/${persistedTodoList.id}/image`)
      .send()
      .expect(200);

    expect(response.body).to.containDeep(todoListImage);
  });

  /*
   ============================================================================
   TEST HELPERS
   These functions help simplify setup of your test fixtures so that your tests
   can:
   - operate on a "clean" environment each time (a fresh in-memory database)
   - avoid polluting the test with large quantities of setup logic to keep
   them clear and easy to read
   - keep them DRY (who wants to write the same stuff over and over?)
   ============================================================================
   */

  async function givenRunningApplicationWithCustomConfiguration() {
    app = new TodoListApplication({
      rest: givenHttpServerConfig(),
    });

    await app.boot();

    /**
     * Override default config for DataSource for testing so we don't write
     * test data to file when using the memory connector.
     */
    app.bind('datasources.config.db').to({
      name: 'db',
      connector: 'memory',
    });

    // Start Application
    await app.start();
  }

  async function givenTodoListImageRepository() {
    todoListImageRepo = await app.getRepository(TodoListImageRepository);
  }

  async function givenTodoListRepository() {
    todoListRepo = await app.getRepository(TodoListRepository);
  }

  async function givenTodoListImageInstanceOfTodoList(
    id: typeof TodoList.prototype.id,
    todoListImage?: Partial<TodoListImage>,
  ) {
    const data = givenTodoListImage(todoListImage);
    delete data.todoListId;
    return await todoListRepo.image(id).create(data);
  }

  async function givenTodoListInstance(todoList?: Partial<TodoList>) {
    return await todoListRepo.create(givenTodoList(todoList));
  }
});
