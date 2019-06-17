import {expect, toJSON} from '@loopback/testlab';
import {
  TodoListImageRepository,
  TodoListRepository,
  TodoRepository,
} from '../../repositories';
import {
  givenEmptyDatabase,
  givenTodoInstance,
  givenTodoListInstance,
  testdb,
} from '../helpers';

describe('TodoListRepository', () => {
  let todoListImageRepo: TodoListImageRepository;
  let todoListRepo: TodoListRepository;
  let todoRepo: TodoRepository;

  before(async () => {
    todoListRepo = new TodoListRepository(
      testdb,
      async () => todoRepo,
      async () => todoListImageRepo,
    );
    todoRepo = new TodoRepository(testdb, async () => todoListRepo);
  });

  beforeEach(givenEmptyDatabase);

  it('includes Todos in find method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoListRepo.find({
      include: [{relation: 'todos'}],
    });

    expect(toJSON(response)).to.deepEqual([
      {
        ...toJSON(list),
        todos: [toJSON(todo)],
      },
    ]);
  });

  it('includes Todos in findById result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoListRepo.findById(list.id, {
      include: [{relation: 'todos'}],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(list),
      todos: [toJSON(todo)],
    });
  });
});
