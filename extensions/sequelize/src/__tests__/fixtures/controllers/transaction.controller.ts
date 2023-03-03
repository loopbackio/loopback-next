import {AnyObject, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody,
} from '@loopback/rest';
import {TodoList} from '../models';
import {ProductRepository, TodoListRepository} from '../repositories';
import {Transaction} from './../../../types';
import {TestControllerBase} from './test.controller.base';

export class TransactionController extends TestControllerBase {
  constructor(
    @repository(TodoListRepository)
    public todoListRepository: TodoListRepository,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {
    super(todoListRepository, productRepository);
  }

  // create todo-list entry using transaction
  @post('/transactions/todo-lists/commit')
  async ensureTransactionCommit(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {
            title: 'NewTodoList',
            exclude: ['id'],
          }),
        },
      },
    })
    todoList: Omit<TodoList, 'id'>,
  ): Promise<TodoList> {
    const tx = await this.todoListRepository.beginTransaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const created = await this.todoListRepository.create(todoList, {
        transaction: tx,
      });
      await tx.commit();
      return created;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // create todo-list entry using transaction but rollback
  @post('/transactions/todo-lists/rollback')
  async ensureRollback(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {
            title: 'NewTodoList',
            exclude: ['id'],
          }),
        },
      },
    })
    todoList: Omit<TodoList, 'id'>,
  ): Promise<TodoList> {
    const tx = await this.todoListRepository.beginTransaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });

    const created = await this.todoListRepository.create(todoList, {
      transaction: tx,
    });
    await tx.rollback();

    // In real applications if you're rolling back. Don't return created entities to user
    // For test cases it's required here. (to get the id)
    return created;
  }

  // create todo-list entry using transaction but don't commit or rollback
  @post('/transactions/todo-lists/isolation/read_commited')
  async ensureIsolatedTransaction(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {
            title: 'NewTodoList',
            exclude: ['id'],
          }),
        },
      },
    })
    todoList: Omit<TodoList, 'id'>,
  ): Promise<TodoList> {
    const tx = await this.todoListRepository.beginTransaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });

    const created = await this.todoListRepository.create(todoList, {
      transaction: tx,
    });

    let err: AnyObject = {};

    // reading before commit in READ_COMMITED level should not find the entity
    const findBeforeCommit = await this.todoListRepository
      .findById(created.id)
      .catch(e => (err = e));

    await tx.commit();

    // throwing it after commit to avoid deadlocks
    if (err) {
      throw err;
    }
    return findBeforeCommit as TodoList;
  }

  @get('/transactions/ensure-local')
  async ensureLocalTransactions(): Promise<AnyObject> {
    // "Todo List" model is from Primary Datasource
    // and "AnyObject" model is from Secondary Datasource
    // this test case is to ensure transaction created on
    // one datasource can't be used in another
    const tx = await this.todoListRepository.beginTransaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });

    let err: AnyObject | null = null;

    try {
      await this.productRepository.create(
        {
          name: 'phone',
          price: 5000,
        },
        {
          transaction: tx,
        },
      );
    } catch (e) {
      err = e;
    }

    await tx.commit();

    if (err) {
      throw new HttpErrors[406](err.message);
    }

    // Won't reach till here if test passes
    throw new HttpErrors[406]('Product created with non-local transaction.');
  }
}
