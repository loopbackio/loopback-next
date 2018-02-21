import {createClientForHandler, expect, supertest} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';
import {TodoApplication} from '../../src/application';
import {TodoRepository} from '../../src/repositories/';
import {givenTodo} from '../helpers';
import {Todo} from '../../src/models/';

describe('Application', () => {
  let app: TodoApplication;
  let server: RestServer;
  let client: supertest.SuperTest<supertest.Test>;
  let todoRepo: TodoRepository;

  before(givenAnApplication);
  before(givenARestServer);
  before(givenTodoRepository);
  before(async () => {
    await app.boot();
    await app.start();
  });
  before(() => {
    client = createClientForHandler(server.handleHttp);
  });
  after(async () => {
    await app.stop();
  });

  it('creates a todo', async () => {
    const todo = givenTodo();
    const response = await client
      .post('/todo')
      .send(todo)
      .expect(200);
    expect(response.body).to.containEql(todo);
    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containEql(todo);
  });

  it('gets a todo by ID', async () => {
    const todo = await givenTodoInstance();
    await client
      .get(`/todo/${todo.id}`)
      .send()
      .expect(200, todo);
  });

  it('replaces the todo by ID', async () => {
    const todo = await givenTodoInstance();
    const updatedTodo = givenTodo({
      title: 'DO SOMETHING AWESOME',
      desc: 'It has to be something ridiculous',
      isComplete: true,
    });
    await client
      .put(`/todo/${todo.id}`)
      .send(updatedTodo)
      .expect(200);
    const result = await todoRepo.findById(todo.id);
    expect(result).to.containEql(updatedTodo);
  });

  it('updates the todo by ID ', async () => {
    const todo = await givenTodoInstance();
    const updatedTodo = givenTodo({
      title: 'DO SOMETHING AWESOME',
      isComplete: true,
    });
    await client
      .patch(`/todo/${todo.id}`)
      .send(updatedTodo)
      .expect(200);
    const result = await todoRepo.findById(todo.id);
    expect(result).to.containEql(updatedTodo);
  });

  it('deletes the todo', async () => {
    const todo = await givenTodoInstance();
    await client
      .del(`/todo/${todo.id}`)
      .send()
      .expect(200);
    try {
      await todoRepo.findById(todo.id);
    } catch (err) {
      expect(err).to.match(/No Todo found with id/);
      return;
    }
    throw new Error('No error was thrown!');
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
  function givenAnApplication() {
    app = new TodoApplication({
      rest: {
        port: 0,
      },
      datasource: {
        connector: 'memory',
      },
    });
  }

  async function givenARestServer() {
    server = await app.getServer(RestServer);
  }

  async function givenTodoRepository() {
    // TODO(bajtos) enhance RepositoryMixin to provide repository getter
    // Example usage:
    //  todoRepo = await app.getRepository<TodoRepository>(TodoRepository.name)
    // See https://github.com/strongloop/loopback-next/issues/745
    todoRepo = (await app.get('repositories.TodoRepository')) as TodoRepository;
  }

  async function givenTodoInstance(todo?: Partial<Todo>) {
    return await todoRepo.create(givenTodo(todo));
  }
});
