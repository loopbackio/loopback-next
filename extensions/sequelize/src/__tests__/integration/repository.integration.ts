import {AnyObject} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  Client,
  StubbedInstanceWithSinonAccessor,
  TestSandbox,
  createRestAppClient,
  createStubInstance,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import _ from 'lodash';
import {resolve} from 'path';
import {UniqueConstraintError} from 'sequelize';
import {fail} from 'should';
import {validate as uuidValidate, version as uuidVersion} from 'uuid';
import {SequelizeCrudRepository, SequelizeDataSource} from '../../sequelize';
import {SequelizeSandboxApplication} from '../fixtures/application';
import {config as primaryDataSourceConfig} from '../fixtures/datasources/primary.datasource';
import {config as secondaryDataSourceConfig} from '../fixtures/datasources/secondary.datasource';
import {ProgrammingLanguage, TableInSecondaryDB} from '../fixtures/models';
import {Box, Event, eventTableName} from '../fixtures/models/test.model';
import {
  DeveloperRepository,
  ProgrammingLanguageRepository,
  TaskRepository,
  UserRepository,
} from '../fixtures/repositories';

type Entities =
  | 'users'
  | 'todo-lists'
  | 'todos'
  | 'doctors'
  | 'developers'
  | 'books'
  | 'products';

describe('Sequelize CRUD Repository (integration)', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  let app: SequelizeSandboxApplication;
  let userRepo: UserRepository;
  let taskRepo: TaskRepository;
  let developerRepo: DeveloperRepository;
  let languagesRepo: ProgrammingLanguageRepository;
  let client: Client;
  let datasource: StubbedInstanceWithSinonAccessor<SequelizeDataSource>;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getAppAndClient);
  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  describe('General', () => {
    beforeEach(async () => {
      await client.get('/users/sync-sequelize-model').send();
    });

    it('throws original error context from sequelize', async () => {
      const userWithId = {
        id: 1,
        name: 'Joe',
        active: true,
      };
      const firstUser = await userRepo.create(userWithId);
      expect(firstUser).to.have.property('id', userWithId.id);
      try {
        throw await userRepo.create(userWithId);
      } catch (err) {
        expect(err).to.be.instanceOf(UniqueConstraintError);
      }
    });

    describe('defaultFn Support', () => {
      beforeEach(async () => {
        await client.get('/tasks/sync-sequelize-model').send();
      });
      it('supports defaultFn: "uuid" in property decorator', async () => {
        const task = await taskRepo.create({title: 'Task 1'});

        expect(uuidValidate(task.uuidv1)).to.be.true();
        expect(uuidVersion(task.uuidv1)).to.be.eql(1);
      });

      it('supports defaultFn: "uuidv4" in property decorator', async () => {
        const task = await taskRepo.create({title: 'Task title'});

        expect(uuidValidate(task.uuidv4)).to.be.true();
        expect(uuidVersion(task.uuidv4)).to.be.eql(4);
      });

      it('supports defaultFn: "nanoid" in property decorator', async () => {
        const task = await taskRepo.create({title: 'Task title'});

        expect(task.nanoId).to.be.String();
        expect(task.nanoId.length).to.be.eql(taskRepo.NANO_ID_LENGTH);
      });

      it('supports defaultFn: "now" in property decorator', async () => {
        const task = await taskRepo.create({title: 'Task title'});
        if (task.createdAt) {
          const isValidDate = _.isDate(task.createdAt);
          expect(isValidDate).to.be.true();
        } else {
          fail(
            task.createdAt,
            '',
            'task.createdAt is falsy, date is expected.',
            'to be in date format',
          );
        }
      });

      it('supports defining custom aliases for defaultFn in property decorator', async () => {
        const task = await taskRepo.create({title: 'Task title'});
        expect(task.customAlias).to.be.Number();
        expect(task.customAlias).to.be.belowOrEqual(1);
        expect(task.customAlias).to.be.above(0);
      });
    });
  });

  describe('Without Relations', () => {
    beforeEach(async () => {
      await client.get('/users/sync-sequelize-model').send();
    });

    it('creates an entity', async () => {
      const user = getDummyUser();
      const createResponse = await client.post('/users').send(user);
      expect(createResponse.body).deepEqual({
        id: 1,
        ..._.omit(user, ['password']),
      });
    });

    it('returns model data without hidden props in response of create', async () => {
      const user = getDummyUser();
      const createResponse = await client.post('/users').send(user);
      expect(createResponse.body).not.to.have.property('password');
    });

    it('[create] allows accessing hidden props before serializing', async () => {
      const user = getDummyUser();
      const userData = await userRepo.create({
        name: user.name,
        address: user.address as AnyObject,
        email: user.email,
        password: user.password,
        dob: user.dob,
        active: user.active,
      });

      expect(userData).to.have.property('password');
      expect(userData.password).to.be.eql(user.password);
      const afterResponse = userData.toJSON();
      expect(afterResponse).to.not.have.property('password');
    });

    it('[find] allows accessing hidden props before serializing', async () => {
      const user = getDummyUser();
      await userRepo.create({
        name: user.name,
        address: user.address as AnyObject,
        email: user.email,
        password: user.password,
        dob: user.dob,
        active: user.active,
      });

      const userData = await userRepo.find();

      expect(userData[0]).to.have.property('password');
      expect(userData[0].password).to.be.eql(user.password);
      const afterResponse = userData[0].toJSON();
      expect(afterResponse).to.not.have.property('password');
    });

    it('[findById] allows accessing hidden props before serializing', async () => {
      const user = getDummyUser();
      const createdUser = await userRepo.create({
        name: user.name,
        address: user.address as AnyObject,
        email: user.email,
        password: user.password,
        dob: user.dob,
        active: user.active,
      });

      const userData = await userRepo.findById(createdUser.id);

      expect(userData).to.have.property('password');
      expect(userData.password).to.be.eql(user.password);
      const afterResponse = userData.toJSON();
      expect(afterResponse).to.not.have.property('password');
    });

    it('creates an entity and finds it', async () => {
      const user = getDummyUser();
      await client.post('/users').send(user);
      const userResponse = await client.get('/users').send();
      expect(userResponse.body).deepEqual([
        {
          id: 1,
          ..._.omit(user, ['password']),
        },
      ]);
    });

    it('counts created entities', async () => {
      await client.post('/users').send(getDummyUser());
      const getResponse = await client.get('/users/count').send();
      expect(getResponse.body).to.have.property('count', 1);
    });

    it('fetches an entity', async () => {
      const createResponse = await client.post('/users').send(getDummyUser());
      const getResponse = await client.get(`/users/${createResponse.body.id}`);
      expect(getResponse.body).deepEqual(createResponse.body);
    });

    it('creates bulk entities', async () => {
      const users = [getDummyUser(), getDummyUser(), getDummyUser()];
      const createAllResponse = await client.post('/users-bulk').send(users);
      expect(createAllResponse.body.length).to.be.equal(users.length);
    });

    it('deletes entity', async () => {
      const users = [getDummyUser(), getDummyUser(), getDummyUser()];
      const createAllResponse = await client.post('/users-bulk').send(users);
      const deleteResponse = await client
        .delete(`/users/${createAllResponse.body[0].id}`)
        .send();
      expect(deleteResponse.statusCode).to.be.equal(204);
    });

    it('updates created entity', async () => {
      const user = getDummyUser();
      const createResponse = await client.post('/users').send(user);
      const condition = {id: createResponse.body.id};
      const patchResponse = await client
        .patch(`/users?where=${encodeURIComponent(JSON.stringify(condition))}`)
        .send({
          name: 'Bar',
        });
      expect(patchResponse.body).to.have.property('count', 1);
    });

    it('can execute raw sql command without parameters', async function () {
      await client.post('/users').send(getDummyUser({name: 'Foo'}));

      const queryResult = await userRepo.execute('SELECT * from "user"');

      expect(queryResult).to.have.length(1);
      expect(queryResult[0]).property('name').to.be.eql('Foo');
    });

    it('can execute raw sql command (select) using named parameters', async function () {
      await client.post('/users').send(getDummyUser({name: 'Foo'}));
      const bar = getDummyUser({name: 'Bar'});
      await client.post('/users').send(bar);

      const queryResult = await userRepo.execute(
        'SELECT * from "user" where name = $name',
        {
          name: 'Bar',
        },
      );

      expect(queryResult).to.have.length(1);
      expect(queryResult[0]).property('name').to.be.eql(bar.name);
      expect(queryResult[0]).property('email').to.be.eql(bar.email);
    });

    it('can execute raw sql command (select) using positional parameters', async () => {
      await client.post('/users').send(getDummyUser({name: 'Foo'}));
      const bar = getDummyUser({name: 'Bar'});
      await client.post('/users').send(bar);

      const queryResult = await userRepo.execute(
        'SELECT * from "user" where name = $1',
        ['Bar'],
      );

      expect(queryResult).to.have.length(1);
      expect(queryResult[0]).property('name').to.be.eql(bar.name);
      expect(queryResult[0]).property('email').to.be.eql(bar.email);
    });

    it('can execute raw sql command (insert) using positional parameters', async () => {
      const user = getDummyUser({name: 'Foo', active: true});
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // sqlite handles object and dates differently
        // it requires format like 2007-01-01 10:00:00 (https://stackoverflow.com/a/1933735/14200863)
        // and sequelize's sqlite dialect parses object returned from db so below reassignments are required here
        user.dob = '2023-05-23T04:12:22.234Z';
        user.address = JSON.stringify(user.address);
      }

      // since the model mapping is not performed when executing raw queries
      // any column renaming need to be changed manually
      user.is_active = user.active;
      delete user.active;

      await userRepo.execute(
        'INSERT INTO "user" (name, email, password, is_active, address, dob) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          user.name,
          user.email,
          user.password,
          user.is_active,
          user.address,
          user.dob,
        ],
      );

      const users = await userRepo.execute('SELECT * from "user"');

      expect(users).to.have.length(1);
      expect(users[0]).property('name').to.be.eql(user.name);
      expect(users[0]).property('email').to.be.eql(user.email);
      expect(users[0]).property('password').to.be.eql(user.password);
      expect(users[0]).property('address').to.be.eql(user.address);
      expect(new Date(users[0].dob)).to.be.eql(new Date(user.dob!));
      expect(users[0]).property('is_active').to.be.ok();
    });

    it('can execute raw sql command (insert) using named parameters', async () => {
      const user = getDummyUser({name: 'Foo', active: true});
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        user.dob = '2023-05-23T04:12:22.234Z';
        user.address = JSON.stringify(user.address);
      }

      // since the model mapping is not performed when executing raw queries
      // any column renaming need to be changed manually
      user.is_active = user.active;
      delete user.active;

      await userRepo.execute(
        'INSERT INTO "user" (name, email, password, is_active, address, dob) VALUES ($name, $email, $password, $is_active, $address, $dob)',
        user,
      );

      const users = await userRepo.execute('SELECT * from "user"');

      expect(users).to.have.length(1);
      expect(users[0]).property('name').to.be.eql(user.name);
      expect(users[0]).property('email').to.be.eql(user.email);
      expect(users[0]).property('password').to.be.eql(user.password);
      expect(users[0]).property('address').to.be.eql(user.address);
      expect(new Date(users[0].dob)).to.be.eql(new Date(user.dob!));
      expect(users[0]).property('is_active').to.be.ok();
    });

    it('can execute raw sql command (insert) using question mark replacement', async () => {
      const user = getDummyUser({name: 'Foo', active: true});
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        user.dob = '2023-05-23T04:12:22.234Z';
      }

      // when using replacements (using "?" mark)
      // sequelize when escaping those values needs them as string (See: https://github.com/sequelize/sequelize/blob/v6/src/sql-string.js#L65-L77)
      user.address = JSON.stringify(user.address);

      // since the model mapping is not performed when executing raw queries
      // any column renaming need to be changed manually
      user.is_active = user.active;
      delete user.active;

      await userRepo.execute(
        'INSERT INTO "user" (name, email, is_active, address, dob) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.is_active, user.address, user.dob],
      );

      const users = await userRepo.execute('SELECT * from "user"');

      expect(users).to.have.length(1);
      expect(users[0]).property('name').to.be.eql(user.name);
      expect(users[0]).property('email').to.be.eql(user.email);
      expect(users[0])
        .property('address')
        .to.be.oneOf(JSON.parse(user.address as string), user.address);
      expect(new Date(users[0].dob)).to.be.eql(new Date(user.dob!));
      expect(users[0]).property('is_active').to.be.ok();
    });

    it('supports `fields` filter', async () => {
      const user = getDummyUser();
      const createResponse = await client.post('/users').send(user);
      const filter = {fields: {name: true}};
      const getResponse = await client.get(
        `/users/${createResponse.body.id}?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`,
      );
      expect(getResponse.body).deepEqual({name: user.name});
    });

    it('supports `order` filter', async () => {
      const users = [
        getDummyUser({name: 'ABoy'}),
        getDummyUser({name: 'BBoy'}),
        getDummyUser({name: 'CBoy'}),
      ];
      const createAllResponse = await client.post('/users-bulk').send(users);
      const reversedArray = [...createAllResponse.body].reverse();
      const filter = {
        order: 'name DESC',
      };
      const getResponse = await client.get(
        `/users?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );
      expect(getResponse.body).to.be.deepEqual(reversedArray);
    });

    it('supports `limit` filter', async () => {
      const users = [getDummyUser(), getDummyUser(), getDummyUser()];
      await client.post('/users-bulk').send(users);
      const filter = {
        limit: 1,
      };
      const getResponse = await client.get(
        `/users?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );
      expect(getResponse.body.length).to.be.equal(filter.limit);
    });

    it('uses table name if explicitly specified in model', async () => {
      const repo = new SequelizeCrudRepository(Event, datasource);
      expect(repo.getTableName()).to.be.eql(eventTableName);
    });

    it('uses exact model class name as table name for mysql', async () => {
      datasource.stubs.sequelizeConfig = {dialect: 'mysql'};
      const repo = new SequelizeCrudRepository(Box, datasource);
      expect(repo.getTableName()).to.be.eql(Box.name);
    });

    it('uses lowercased model class name as table name for postgres', async () => {
      datasource.stubs.sequelizeConfig = {dialect: 'postgres'};
      const repo = new SequelizeCrudRepository(Box, datasource);
      expect(repo.getTableName()).to.be.eql(Box.name.toLowerCase());
    });
  });

  describe('With Relations', () => {
    async function migrateSchema(entities: Array<Entities>) {
      for (const route of entities) {
        await client.get(`/${route}/sync-sequelize-model`).send();
      }
    }

    it('supports @hasOne', async () => {
      await migrateSchema(['users', 'todo-lists']);

      const user = getDummyUser();
      const userRes = await client.post('/users').send(user);
      const todoList = getDummyTodoList({user: userRes.body.id});
      const todoListRes = await client.post('/todo-lists').send(todoList);

      const filter = {include: ['todoList']};
      const relationRes = await client.get(
        `/users?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      expect(relationRes.body).to.be.deepEqual([
        {
          ...userRes.body,
          todoList: todoListRes.body,
        },
      ]);
    });

    it('supports @hasMany', async () => {
      await migrateSchema(['todos', 'todo-lists']);

      const todoList = getDummyTodoList();
      const todoListRes = await client.post('/todo-lists').send(todoList);

      const todo = getDummyTodo({todoListId: todoListRes.body.id});
      const todoRes = await client.post('/todos').send(todo);

      const filter = {include: ['todos']};
      const relationRes = await client.get(
        `/todo-lists?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      expect(relationRes.body).to.be.deepEqual([
        {
          ...todoListRes.body,
          todos: [todoRes.body],
          user: null,
        },
      ]);
    });

    it('supports @belongsTo', async () => {
      await migrateSchema(['books']);

      const categories = [
        {name: 'Programming'},
        {name: 'Cooking'},
        {name: 'Self Help'},
      ];

      const categoryResponse = await client
        .post('/categories-bulk')
        .send(categories);

      type Category = {name: string; id: number};

      const books = [
        {
          title: 'The Art of Cooking',
          categoryId: categoryResponse.body.find(
            (cat: Category) => cat.name === 'Cooking',
          ).id,
        },
        {
          title: 'JavaScript the Art of Web',
          categoryId: categoryResponse.body.find(
            (cat: Category) => cat.name === 'Programming',
          ).id,
        },
        {
          title: '7 Rules of life',
          categoryId: categoryResponse.body.find(
            (cat: Category) => cat.name === 'Self Help',
          ).id,
        },
      ];

      await client.post('/books-bulk').send(books);

      const filter = {
        where: {title: {like: '%Art%'}},
        include: [
          {
            relation: 'category',
            scope: {where: {name: 'Programming'}},
            required: true,
          },
        ],
      };

      const relationRes = await client
        .get(`/books?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .send();

      // If only 1 entry is returned it ensures that the cooking entry is not envolved.
      // Confirming the fact that it used inner join behind the scenes
      expect(relationRes.body.length).to.be.equal(1);
      expect(relationRes.body[0].category).to.be.deepEqual(
        categoryResponse.body.find(
          (cat: Category) => cat.name === 'Programming',
        ),
      );
    });

    it('supports @belongsTo using keyfrom and keyto', async () => {
      await migrateSchema(['users', 'todos', 'todo-lists']);

      const userRes = await client.post('/users').send(getDummyUser());

      const todoOne = await client.post('/todo-lists').send(
        getDummyTodoList({
          title: 'Todo list one',
          user: userRes.body.id,
        }),
      );
      const todoListRes = await client.post('/todo-lists').send(
        getDummyTodoList({
          title: 'Another todo list',
          user: userRes.body.id,
        }),
      );

      let todo = getDummyTodo({
        title: 'Todo one',
        todoListId: todoListRes.body.id,
      });
      const todoRes = await client.post('/todos').send(todo);
      todo = getDummyTodo({
        title: 'Another todo',
        todoListId: todoOne.body.id,
      });
      await client.post('/todos').send(todo);

      const filter = {
        where: {
          title: {like: '%one%'},
        },
        include: ['todoList'],
      };
      const relationRes = await client.get(
        `/todos?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      expect(relationRes.body).to.be.deepEqual([
        {
          ...todoRes.body,
          todoList: todoListRes.body,
        },
      ]);
    });

    it('supports @hasMany through', async () => {
      await migrateSchema(['doctors']);

      const doctorRes = await client.post('/doctors').send(getDummyDoctor());
      const patientRes = await client
        .post(`/doctors/${1}/patients`)
        .send(getDummyPatient());

      const filter = {include: ['patients']};
      const relationRes = await client.get(
        `/doctors?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      /**
       * Manually Remove through table data as sqlite3 doesn't support `attributes: []` using sequelize
       */
      delete relationRes.body[0].patients[0].Appointment;

      expect(relationRes.body).to.be.deepEqual([
        {
          ...doctorRes.body,
          patients: [patientRes.body],
        },
      ]);
    });

    it('supports @referencesMany', async () => {
      await migrateSchema(['developers']);

      const programmingLanguages = [
        getDummyProgrammingLanguage({name: 'JS', secret: 'Practice'}),
        getDummyProgrammingLanguage({name: 'Java', secret: 'Practice'}),
        getDummyProgrammingLanguage({name: 'Dot Net', secret: 'Practice'}),
      ];
      const createAllResponse = await client
        .post('/programming-languages-bulk')
        .send(programmingLanguages);

      const createDeveloperResponse = await client.post('/developers').send(
        getDummyDeveloper({
          apiSecret: 'xyz-123-abcd',
          programmingLanguageIds: createAllResponse.body.map(
            (language: {id: number}) => language.id,
          ),
        }),
      );

      const filter = {include: ['programmingLanguages']};
      const relationRes = await client
        .get(
          `/developers/${
            createDeveloperResponse.body.id
          }?filter=${encodeURIComponent(JSON.stringify(filter))}`,
        )
        .send();

      if (primaryDataSourceConfig.connector === 'sqlite3') {
        /**
         * sqlite3 doesn't support array data type using it will convert values
         * to comma saperated string
         */
        createDeveloperResponse.body.programmingLanguageIds =
          createDeveloperResponse.body.programmingLanguageIds.join(',');
      }

      expect(relationRes.body).to.be.deepEqual({
        ...createDeveloperResponse.body,
        programmingLanguages: createAllResponse.body,
      });
    });

    it('hides hidden props for nested entities included with referencesMany relation', async () => {
      await developerRepo.syncLoadedSequelizeModels({force: true});

      const programmingLanguages = [
        getDummyProgrammingLanguage({name: 'JS', secret: 'woo'}),
        getDummyProgrammingLanguage({name: 'Java', secret: 'woo'}),
        getDummyProgrammingLanguage({name: 'Dot Net', secret: 'woo'}),
      ];

      const createAllResponse =
        await languagesRepo.createAll(programmingLanguages);
      expect(createAllResponse[0]).to.have.property('secret');

      const createDeveloperResponse = await developerRepo.create(
        getDummyDeveloper({
          apiSecret: 'xyz-123-abcd',
          programmingLanguageIds: createAllResponse.map(
            (language: ProgrammingLanguage) => language.id,
          ),
        }),
      );

      const filter = {include: ['programmingLanguages']};
      const relationRes = await developerRepo.findById(
        createDeveloperResponse.id,
        filter,
      );

      if (primaryDataSourceConfig.connector === 'sqlite3') {
        /**
         * sqlite3 doesn't support array data type using it will convert values
         * to comma saperated string
         */
        createDeveloperResponse.programmingLanguageIds =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createDeveloperResponse.programmingLanguageIds.join(',') as any;
      }

      expect(relationRes.toJSON()).to.be.deepEqual({
        ...createDeveloperResponse.toJSON(),
        programmingLanguages: createAllResponse.map(e => e.toJSON()),
      });
    });

    it('supports INNER JOIN', async () => {
      await migrateSchema(['books']);

      const categories = [
        {name: 'Programming'},
        {name: 'Cooking'},
        {name: 'Self Help'},
      ];

      const categoryResponse = await client
        .post('/categories-bulk')
        .send(categories);

      type Category = {name: string; id: number};

      const books = [
        {
          title: 'The Art of Cooking',
          categoryId: categoryResponse.body.find(
            (cat: Category) => cat.name === 'Cooking',
          ).id,
        },
        {
          title: 'JavaScript the Art of Web',
          categoryId: categoryResponse.body.find(
            (cat: Category) => cat.name === 'Programming',
          ).id,
        },
        {
          title: '7 Rules of life',
          categoryId: categoryResponse.body.find(
            (cat: Category) => cat.name === 'Self Help',
          ).id,
        },
      ];

      await client.post('/books-bulk').send(books);

      const filter = {
        where: {title: {like: '%Art%'}},
        include: [
          {
            relation: 'category',
            scope: {where: {name: 'Programming'}},
            required: true,
          },
        ],
      };

      const relationRes = await client
        .get(`/books?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .send();

      // If only 1 entry is returned it ensures that the cooking entry is not envolved.
      // Confirming the fact that it used inner join behind the scenes
      expect(relationRes.body.length).to.be.equal(1);
    });

    it('throws error if the repository does not have registered resolvers', async () => {
      try {
        await userRepo.find({
          include: ['nonExistingRelation'],
        });
      } catch (err) {
        expect(err.message).to.be.eql(
          `Invalid "filter.include" entries: "nonExistingRelation"`,
        );
        expect(err.statusCode).to.be.eql(400);
        expect(err.code).to.be.eql('INVALID_INCLUSION_FILTER');
      }
    });
  });

  describe('Connections', () => {
    async function migrateSchema(entities: Array<Entities>) {
      for (const route of entities) {
        await client.get(`/${route}/sync-sequelize-model`).send();
      }
    }
    it('can work with two datasources together', async () => {
      await migrateSchema(['todo-lists', 'products']);

      // todo-lists model uses primary datasource
      const todoList = getDummyTodoList();
      const todoListCreateRes = await client.post('/todo-lists').send(todoList);

      // products model uses secondary datasource
      const product = getDummyProduct();
      const productCreateRes = await client.post('/products').send(product);

      expect(todoListCreateRes.body).to.have.properties('id', 'title');
      expect(productCreateRes.body).to.have.properties('id', 'name', 'price');
      expect(todoListCreateRes.body.title).to.be.equal(todoList.title);
      expect(productCreateRes.body.name).to.be.equal(product.name);
    });
  });

  describe('Transactions', () => {
    const DB_ERROR_MESSAGES = {
      invalidTransaction: [
        `relation "${TableInSecondaryDB}" does not exist`,
        `SQLITE_ERROR: no such table: ${TableInSecondaryDB}`,
      ],
    };
    async function migrateSchema(entities: Array<Entities>) {
      for (const route of entities) {
        await client.get(`/${route}/sync-sequelize-model`).send();
      }
    }

    it('retrieves model instance once transaction is committed', async () => {
      await migrateSchema(['todo-lists']);

      const todoList = getDummyTodoList();
      const todoListCreateRes = await client
        .post('/transactions/todo-lists/commit')
        .send(todoList);

      const todoListReadRes = await client.get(
        `/todo-lists/${todoListCreateRes.body.id}`,
      );

      expect(todoListReadRes.body).to.have.properties('id', 'title');
      expect(todoListReadRes.body.title).to.be.equal(todoList.title);
    });

    it('can rollback transaction', async function () {
      await migrateSchema(['todo-lists']);

      const todoList = getDummyTodoList();
      const todoListCreateRes = await client
        .post('/transactions/todo-lists/rollback')
        .send(todoList);

      const todoListReadRes = await client.get(
        `/todo-lists/${todoListCreateRes.body.id}`,
      );

      expect(todoListReadRes.body).to.have.properties('error');
      expect(todoListReadRes.body.error.code).to.be.equal('ENTITY_NOT_FOUND');
    });

    it('ensures transactions are isolated', async function () {
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // Skip "READ_COMMITED" test for sqlite3 as it doesn't support it through isolationLevel options.
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      } else {
        await migrateSchema(['todo-lists']);

        const todoList = getDummyTodoList();
        const todoListCreateRes = await client
          .post('/transactions/todo-lists/isolation/read_commited')
          .send(todoList);

        expect(todoListCreateRes.body).to.have.properties('error');
        expect(todoListCreateRes.body.error.code).to.be.equal(
          'ENTITY_NOT_FOUND',
        );
      }
    });

    it('ensures local transactions (should not use transaction with another repository of different datasource)', async function () {
      if (secondaryDataSourceConfig.connector === 'sqlite3') {
        // Skip local transactions test for sqlite3 as it doesn't support it through isolationLevel options.
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      } else {
        await migrateSchema(['todo-lists', 'products']);

        const response = await client.get('/transactions/ensure-local').send();

        expect(response.body).to.have.properties('error');
        expect(response.body.error.message).to.be.oneOf(
          DB_ERROR_MESSAGES.invalidTransaction,
        );
      }
    });
  });

  async function getAppAndClient() {
    const artifacts: AnyObject = {
      datasources: ['config', 'primary.datasource', 'secondary.datasource'],
      models: [
        'index',
        'todo.model',
        'todo-list.model',
        'user.model',
        'doctor.model',
        'patient.model',
        'appointment.model',
        'programming-language.model',
        'developer.model',
        'book.model',
        'category.model',
        'product.model',
        'task.model',
      ],
      repositories: [
        'index',
        'todo.repository',
        'todo-list.repository',
        'user.repository',
        'doctor.repository',
        'patient.repository',
        'appointment.repository',
        'developer.repository',
        'programming-language.repository',
        'book.repository',
        'category.repository',
        'product.repository',
        'task.repository',
      ],
      controllers: [
        'index',
        'book-category.controller',
        'book.controller',
        'category.controller',
        'developer.controller',
        'doctor-patient.controller',
        'doctor.controller',
        'patient.controller',
        'programming-languange.controller',
        'todo-list-todo.controller',
        'todo-list.controller',
        'todo-todo-list.controller',
        'todo.controller',
        'user-todo-list.controller',
        'user.controller',
        'transaction.controller',
        'product.controller',
        'test.controller.base',
        'task.controller',
      ],
    };

    const copyFilePromises: Array<Promise<unknown>> = [];

    for (const folder in artifacts) {
      artifacts[folder].forEach((fileName: string) => {
        copyFilePromises.push(
          sandbox.copyFile(
            resolve(__dirname, `../fixtures/${folder}/${fileName}.js`),
            `${folder}/${fileName}.js`,
          ),
        );
      });
    }

    await Promise.all([
      sandbox.copyFile(resolve(__dirname, '../fixtures/application.js')),

      ...copyFilePromises,
    ]);

    const MyApp = require(
      resolve(sandbox.path, 'application.js'),
    ).SequelizeSandboxApplication;
    app = new MyApp({
      rest: givenHttpServerConfig(),
    });

    await app.boot();
    await app.start();

    userRepo = await app.getRepository(UserRepository);
    datasource = createStubInstance(SequelizeDataSource);
    developerRepo = await app.getRepository(DeveloperRepository);
    languagesRepo = await app.getRepository(ProgrammingLanguageRepository);
    taskRepo = await app.getRepository(TaskRepository);
    client = createRestAppClient(app as RestApplication);
  }

  function getDummyUser(overwrite = {}) {
    const date = new Date();
    const timestamp = date.toISOString();

    type DummyUser = {
      name: string;
      email: string;
      active?: boolean;
      address: AnyObject | string;
      password?: string;
      dob: Date | string;
    } & AnyObject;

    const user: DummyUser = {
      name: 'Foo',
      email: 'email@example.com',
      active: true,
      address: {city: 'Indore', zipCode: 452001},
      password: 'secret',
      dob: timestamp,
      ...overwrite,
    };
    return user;
  }
  function getDummyTodoList(overwrite = {}) {
    const todoList = {
      title: 'My Todo List',
      ...overwrite,
    };
    return todoList;
  }
  function getDummyProduct(overwrite = {}) {
    const todoList = {
      name: 'Phone',
      price: 5000,
      ...overwrite,
    };
    return todoList;
  }

  function getDummyTodo(overwrite = {}) {
    const todo = {
      title: 'Fix Bugs',
      isComplete: false, // can never be true :P
      ...overwrite,
    };
    return todo;
  }
  function getDummyDoctor(overwrite = {}) {
    const doctor = {
      name: 'Dr. Foo',
      ...overwrite,
    };
    return doctor;
  }
  function getDummyPatient(overwrite = {}) {
    const patient = {
      name: 'Foo',
      ...overwrite,
    };
    return patient;
  }
  function getDummyProgrammingLanguage(overwrite = {}) {
    const programmingLanguage = {
      name: 'JavaScript',
      ...overwrite,
    };
    return programmingLanguage;
  }
  function getDummyDeveloper(overwrite = {}) {
    const developer = {
      name: 'Foo',
      ...overwrite,
    };
    return developer;
  }
});
