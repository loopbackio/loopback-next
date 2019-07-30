// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {TodoListApplication} from '../../application';
import {TodoList, TodoListImage} from '../../models/';
import {TodoListImageRepository, TodoListRepository} from '../../repositories/';
import {
  givenRunningApplicationWithCustomConfiguration,
  givenTodoListImage,
  givenTodoListInstance,
  givenTodoListRepositories,
} from '../helpers';

describe('TodoListApplication', () => {
  let app: TodoListApplication;
  let client: Client;
  let todoListRepo: TodoListRepository;
  let todoListImageRepo: TodoListImageRepository;

  let persistedTodoList: TodoList;

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(async () => {
    ({todoListRepo, todoListImageRepo} = await givenTodoListRepositories(app));
  });
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await todoListImageRepo.deleteAll();
    await todoListRepo.deleteAll();
  });

  beforeEach(async () => {
    persistedTodoList = await givenTodoListInstance(todoListRepo);
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

  async function givenTodoListImageInstanceOfTodoList(
    id: typeof TodoList.prototype.id,
    todoListImage?: Partial<TodoListImage>,
  ) {
    const data = givenTodoListImage(todoListImage);
    delete data.todoListId;
    return todoListRepo.image(id).create(data);
  }
});
