import {AnyObject, EntityNotFoundError} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  Client,
  StubbedInstanceWithSinonAccessor,
  TestSandbox,
  createRestAppClient,
  createStubInstance,
  expect,
  givenHttpServerConfig,
  sinon,
} from '@loopback/testlab';
import _ from 'lodash';
import {resolve} from 'path';
import {
  ModelStatic,
  Sequelize,
  Model as SequelizeModel,
  UniqueConstraintError,
} from 'sequelize';
import {fail} from 'should';
import {validate as uuidValidate, version as uuidVersion} from 'uuid';
import {SequelizeCrudRepository, SequelizeDataSource} from '../../sequelize';
import {SequelizeSandboxApplication} from '../fixtures/application';
import {config as primaryDataSourceConfig} from '../fixtures/datasources/primary.datasource';
import {config as secondaryDataSourceConfig} from '../fixtures/datasources/secondary.datasource';
import {
  ProgrammingLanguage,
  TableInSecondaryDB,
  User,
} from '../fixtures/models';
import {Box, Event, eventTableName} from '../fixtures/models/test.model';
import {
  DeveloperRepository,
  ProgrammingLanguageRepository,
  TaskRepository,
  UserRepository,
} from '../fixtures/repositories';
import {ScopedTaskRepository} from '../fixtures/repositories/scoped-task.repository';

type Entities =
  | 'users'
  | 'todo-lists'
  | 'todos'
  | 'doctors'
  | 'developers'
  | 'books'
  | 'products'
  | 'roles';

describe('Sequelize CRUD Repository (integration)', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  let app: SequelizeSandboxApplication;
  let userRepo: UserRepository;
  let taskRepo: TaskRepository;
  let scopedTaskRepo: ScopedTaskRepository;
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

    describe('Model settings Support', () => {
      beforeEach(async () => {
        await client.get('/scoped-tasks/sync-sequelize-model').send();
      });
      it('supports setting a default "scope" in the Model settings', async () => {
        await Promise.all([
          scopedTaskRepo.create({title: 'Task 1'}),
          scopedTaskRepo.create({title: 'Task 2'}),
          scopedTaskRepo.create({title: 'Task 3'}),
        ]);

        const tasksDefaultLimit = await scopedTaskRepo.find();

        expect(tasksDefaultLimit.length).to.be.eql(1);

        const tasksCustomLimit = await scopedTaskRepo.find({
          limit: 3,
        });

        expect(tasksCustomLimit.length).to.be.eql(3);
      });

      it('supports setting a default "where" filter in the Model settings', async () => {
        await Promise.all([
          scopedTaskRepo.create({title: 'Task 1', completed: true}),
          scopedTaskRepo.create({title: 'Task 2', completed: false}),
        ]);

        const tasksDefaultWhereFilter = await scopedTaskRepo.find({
          limit: 2,
        });

        expect(tasksDefaultWhereFilter).to.have.lengthOf(1);
        expect(tasksDefaultWhereFilter[0].title).to.eql('Task 2');

        const tasksCustomWhereFilter = await scopedTaskRepo.find({
          where: {
            completed: true,
          },
          limit: 2,
        });

        expect(tasksCustomWhereFilter).to.have.lengthOf(1);
        expect(tasksCustomWhereFilter[0].title).to.eql('Task 1');
      });
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

    it('[find] excludes undefined props from where filter', async () => {
      const user = getDummyUser();
      await userRepo.create({
        name: user.name,
        address: user.address as AnyObject,
        email: user.email,
        password: user.password,
        dob: user.dob,
        active: user.active,
      });

      const userData = await userRepo.find({
        where: {name: user.name, email: user.email, password: undefined},
      });

      expect(userData.length).to.be.eql(1);
      expect(userData[0]).to.have.property('name', user.name);
      expect(userData[0]).to.have.property('email', user.email);
      expect(userData[0]).to.have.property('password', user.password);
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

    it('creates an entity and finds it using Where filter boolean conditions', async () => {
      const user = getDummyUser();

      await client.post('/users').send(user);

      const expectedUser = {
        id: 1,
        ..._.omit(user, ['password']),
      };

      const userResponse1 = await client
        .get('/users')
        .query({
          filter: {
            where: {
              active: true,
            },
          },
        })
        .send();

      expect(userResponse1.body).deepEqual([expectedUser]);

      const userResponse2 = await client
        .get('/users')
        .query({
          filter: {
            where: {
              active: false,
            },
          },
        })
        .send();

      expect(userResponse2.body).deepEqual([]);

      const userResponse3 = await client
        .get('/users')
        .query({
          filter: {
            where: {
              active: {
                eq: true,
              },
            },
          },
        })
        .send();

      expect(userResponse3.body).deepEqual([expectedUser]);

      const userResponse4 = await client
        .get('/users')
        .query({
          filter: {
            where: {
              active: {
                eq: false,
              },
            },
          },
        })
        .send();

      expect(userResponse4.body).deepEqual([]);
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

    describe('updates created entity with MySQL dialect', () => {
      let seqQueryStub: sinon.SinonStub;
      let repo: SequelizeCrudRepository<User, unknown, {}>;
      let userModel: ModelStatic<SequelizeModel>;

      beforeEach(() => {
        seqQueryStub = sinon.stub(Sequelize.prototype, 'query');
        datasource.sequelize = new Sequelize({
          dialect: 'mysql',
        });
        datasource.sequelizeConfig = {
          host: '0.0.0.0',
          dialect: 'mysql',
          database: 'transaction-primary',
        };
        repo = new SequelizeCrudRepository(User, datasource);
        userModel = datasource.sequelize.model(repo.entityClass.modelName);
      });
      afterEach(() => {
        seqQueryStub.restore();
      });

      it('should check for the entity when affectedRow return 0', async () => {
        seqQueryStub
          .onFirstCall()
          .resolves(0 as never)
          .onSecondCall()
          .resolves(
            userModel
              .bulkBuild(
                [
                  {
                    id: 1,
                    username: 'string',
                    password: 'password:varchar',
                    email: 'email:varchar',
                    registerDate: '2024-01-24T11:02:16.000Z',
                  },
                ],
                {raw: true},
              )
              .pop() as never,
          );

        await repo.updateById(1, {name: 'UpdatedName'});
        expect(seqQueryStub.callCount).to.be.equal(2);
      });

      it('should check for the entity and throw "EntityNotFoundError" when entity missing', async () => {
        try {
          seqQueryStub
            .onFirstCall()
            .resolves(0 as never)
            .onSecondCall()
            .resolves(null as never);
          await repo.updateById(1, {name: 'UpdatedName'});
        } catch (err) {
          expect(err).to.instanceOf(EntityNotFoundError);
        }
        expect(seqQueryStub.callCount).to.be.equal(2);
      });
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
    it('can execute command (select query with parenthesis) without parameters', async function () {
      await client.post('/users').send(getDummyUser({name: 'Foo'}));
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // Skip executing select query with bracket if datasource is sqlite
        // since it doesn't support it
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      }
      const queryResult = await userRepo.execute('(SELECT * from "user")');

      expect(queryResult).to.have.length(1);
      expect(queryResult[0]).property('name').to.be.eql('Foo');
    });

    it('can execute command (select query with parenthesis) using named parameters', async function () {
      await client.post('/users').send(getDummyUser({name: 'Foo'}));
      const bar = getDummyUser({name: 'Bar'});
      await client.post('/users').send(bar);
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // Skip executing select query with bracket if datasource is sqlite
        // since it doesn't support it
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      }
      const queryResult = await userRepo.execute(
        '(SELECT * from "user" where name = $name)',
        {
          name: 'Bar',
        },
      );

      expect(queryResult).to.have.length(1);
      expect(queryResult[0]).property('name').to.be.eql(bar.name);
      expect(queryResult[0]).property('email').to.be.eql(bar.email);
    });
    it('can execute raw sql command (select query with parenthesis) using positional parameters', async function () {
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // Skip executing select query with bracket if datasource is sqlite
        // since it doesn't support it
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      }
      await client.post('/users').send(getDummyUser({name: 'Foo'}));
      const bar = getDummyUser({name: 'Bar'});
      await client.post('/users').send(bar);

      const queryResult = await userRepo.execute(
        '(SELECT * from "user" where name = $1)',
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
        user.phoneNumbers = JSON.stringify(user.phoneNumbers);
      }

      // since the model mapping is not performed when executing raw queries
      // any column renaming need to be changed manually
      user.is_active = user.active;
      delete user.active;

      await userRepo.execute(
        'INSERT INTO "user" (name, email, password, is_active, address, dob, phone_numbers) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          user.name,
          user.email,
          user.password,
          user.is_active,
          user.address,
          user.dob,
          user.phoneNumbers,
        ],
      );

      const users = await userRepo.execute('SELECT * from "user"');

      expect(users).to.have.length(1);
      expect(users[0]).property('name').to.be.eql(user.name);
      expect(users[0]).property('email').to.be.eql(user.email);
      expect(users[0]).property('password').to.be.eql(user.password);
      expect(users[0]).property('address').to.be.eql(user.address);
      expect(users[0]).property('phone_numbers').to.be.eql(user.phoneNumbers);
      expect(new Date(users[0].dob)).to.be.eql(new Date(user.dob!));
      expect(users[0]).property('is_active').to.be.ok();
    });

    it('can execute raw sql command (insert) using named parameters', async () => {
      const user = getDummyUser({name: 'Foo', active: true});
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        user.dob = '2023-05-23T04:12:22.234Z';
        user.address = JSON.stringify(user.address);
        user.phoneNumbers = JSON.stringify(user.phoneNumbers);
      }

      const expectedPhoneNumbers = user.phoneNumbers;

      // since the model mapping is not performed when executing raw queries
      // any column renaming need to be changed manually
      user.is_active = user.active;
      delete user.active;
      user.phone_numbers = user.phoneNumbers;
      delete user.phoneNumbers;

      await userRepo.execute(
        'INSERT INTO "user" (name, email, password, is_active, phone_numbers, address, dob) VALUES ($name, $email, $password, $is_active, $phone_numbers, $address, $dob)',
        user,
      );

      const users = await userRepo.execute('SELECT * from "user"');

      expect(users).to.have.length(1);
      expect(users[0]).property('name').to.be.eql(user.name);
      expect(users[0]).property('email').to.be.eql(user.email);
      expect(users[0]).property('password').to.be.eql(user.password);
      expect(users[0]).property('address').to.be.eql(user.address);
      expect(users[0])
        .property('phone_numbers')
        .to.be.eql(expectedPhoneNumbers);
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
      user.phoneNumbers = JSON.stringify(user.phoneNumbers);

      await userRepo.execute(
        'INSERT INTO "user" (name, email, is_active, address, dob, phone_numbers) VALUES (?, ?, ?, ?, ?, ?)',
        [
          user.name,
          user.email,
          user.active,
          user.address,
          user.dob,
          user.phoneNumbers,
        ],
      );

      const users = await userRepo.execute('SELECT * from "user"');

      expect(users).to.have.length(1);
      expect(users[0]).property('name').to.be.eql(user.name);
      expect(users[0]).property('email').to.be.eql(user.email);
      expect(users[0])
        .property('address')
        .to.be.oneOf(JSON.parse(user.address as string), user.address);
      expect(users[0])
        .property('phone_numbers')
        .to.be.oneOf(
          JSON.parse(user.phoneNumbers as string),
          user.phoneNumbers,
        );
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

    it('ignores an empty `order` filter', async () => {
      const users = [
        getDummyUser({name: 'ABoy'}),
        getDummyUser({name: 'BBoy'}),
        getDummyUser({name: 'CBoy'}),
      ];
      const createAllResponse = await client.post('/users-bulk').send(users);
      const filter = {
        order: '',
      };
      const getResponse = await client.get(`/users`).query({
        filter,
      });

      expect(getResponse.body).to.be.deepEqual(createAllResponse.body);
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

    it('parses JSON columns returned as strings for the mysql dialect by default using a custom Sequelize getter', async () => {
      const mySQLDataSource = new SequelizeDataSource({
        name: 'db',
        connector: 'mysql',
      });

      expect(mySQLDataSource.parseJsonColumns).to.be.eql(true);

      const repo = new SequelizeCrudRepository(User, mySQLDataSource);

      expect(
        repo.sequelizeModel.getAttributes().address.get,
      ).to.be.a.Function();

      const Model = repo.getSequelizeModel(User);
      const model = new Model();
      const address = {street: '123', city: 'NYC'};

      model.set('address', JSON.stringify(address));
      expect(model.get('address')).to.be.eql(address);

      model.set('address', '{ malformed JSON string');
      expect(model.get('address')).to.be.eql(null);

      model.set('address', address);
      expect(model.get('address')).to.be.eql(address);
    });

    it('defaults to false for the "parseJsonColumns" option for non-mysql dialects', async () => {
      const loopbackConnectors = ['sqlite3', 'postgresql', 'oracle'] as const;

      for (const connector of loopbackConnectors) {
        const mySQLDataSource = new SequelizeDataSource({
          name: 'db',
          connector,
        });

        expect(mySQLDataSource.parseJsonColumns).to.be.eql(false);
      }
    });

    it('overrides default json column parsing settings via the "parseJsonColumns" option', async () => {
      const mySQLDataSource = new SequelizeDataSource({
        name: 'db',
        connector: 'mysql',
        parseJsonColumns: false,
      });

      expect(mySQLDataSource.parseJsonColumns).to.be.eql(false);

      const repo = new SequelizeCrudRepository(User, mySQLDataSource);

      expect(
        repo.sequelizeModel.getAttributes().address.get,
      ).not.to.be.a.Function();

      const Model = repo.getSequelizeModel(User);
      const model = new Model();
      const address = {street: '123', city: 'NYC'};
      const stringifiedAddress = JSON.stringify(address);

      model.set('address', JSON.stringify(address));
      expect(model.get('address')).to.be.eql(stringifiedAddress);

      model.set('address', address);
      expect(model.get('address')).to.be.eql(address);
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
      const todoList = getDummyTodoList({userId: userRes.body.id});
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
          userId: null,
        },
      ]);
    });

    it('supports `order` filter by associations', async () => {
      await migrateSchema(['todos', 'todo-lists']);

      const todoList = getDummyTodoList({title: 'a'});
      const todoList2 = getDummyTodoList({title: 'b'});

      const todoListRes1 = await client.post('/todo-lists').send(todoList);
      const todoListRes2 = await client.post('/todo-lists').send(todoList2);

      const todo1 = getDummyTodo({
        todoListId: todoListRes1.body.id,
        title: 'b',
      });
      const todo2 = getDummyTodo({
        todoListId: todoListRes2.body.id,
        title: 'a',
      });

      const todoRes1 = await client.post('/todos').send(todo1);
      const todoRes2 = await client.post('/todos').send(todo2);

      const includeFilter = {include: ['todos']};
      const relationResNoOrder = await client.get(`/todo-lists`).query({
        filter: JSON.stringify({...includeFilter}),
      });

      expect(relationResNoOrder.body).to.be.deepEqual([
        {
          ...todoListRes1.body,
          todos: [todoRes1.body],
          userId: null,
        },
        {
          ...todoListRes2.body,
          todos: [todoRes2.body],
          userId: null,
        },
      ]);

      const relationResOrderByTodoList = await client.get(`/todo-lists`).query({
        filter: JSON.stringify({...includeFilter, order: 'title DESC'}),
      });

      expect(relationResOrderByTodoList.body).to.be.deepEqual([
        {
          ...todoListRes2.body,
          todos: [todoRes2.body],
          userId: null,
        },
        {
          ...todoListRes1.body,
          todos: [todoRes1.body],
          userId: null,
        },
      ]);

      const relationResOrderByTodo = await client.get(`/todo-lists`).query({
        filter: JSON.stringify({...includeFilter, order: 'todos title DESC'}),
      });

      expect(relationResOrderByTodo.body).to.be.deepEqual([
        {
          ...todoListRes1.body,
          todos: [todoRes1.body],
          userId: null,
        },
        {
          ...todoListRes2.body,
          todos: [todoRes2.body],
          userId: null,
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

    it('hides hidden properties in related entities included with @belongsTo relation', async () => {
      await migrateSchema(['todos', 'todo-lists', 'users']);

      const userRes = await client.post('/users').send(getDummyUser());

      await client.post('/todo-lists').send(
        getDummyTodoList({
          title: 'Todo list one',
          userId: userRes.body.id,
        }),
      );

      const filter = {include: ['user']};
      const relationRes = await client.get(`/todo-lists`).query({
        filter: JSON.stringify(filter),
      });

      expect(relationRes.body.length).to.be.equal(1);
      expect(relationRes.body.at(0).user).not.to.have.property('password');
    });

    it('supports @belongsTo using keyfrom and keyto', async () => {
      await migrateSchema(['users', 'todos', 'todo-lists']);

      const userRes = await client.post('/users').send(getDummyUser());

      const todoOne = await client.post('/todo-lists').send(
        getDummyTodoList({
          title: 'Todo list one',
          userId: userRes.body.id,
        }),
      );
      const todoListRes = await client.post('/todo-lists').send(
        getDummyTodoList({
          title: 'Another todo list',
          userId: userRes.body.id,
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
        .post(`/doctors/${doctorRes.body.id}/patients`)
        .send(getDummyPatient());

      const filter = {include: ['patients']};
      const relationRes = await client
        .get(`/doctors`)
        .query({filter: JSON.stringify(filter)});

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

    it('hides hidden props for nested entities included with @hasMany relation', async () => {
      await migrateSchema(['doctors']);

      const doctorRes = await client.post('/doctors').send(getDummyDoctor());

      await client.post(`/doctors/${doctorRes.body.id}/patients`).send(
        getDummyPatient({
          password: 'secret',
        }),
      );

      const filter = {include: ['patients']};
      const relationRes = await client
        .get(`/doctors`)
        .query({filter: JSON.stringify(filter)});

      expect(relationRes.body.length).to.be.equal(1);
      expect(relationRes.body.at(0)).to.have.property('patients');
      expect(relationRes.body.at(0).patients.at(0)).to.not.have.property(
        'password',
      );
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

  describe('Extended Operators for postgres', () => {
    async function migrateSchema(entities: Array<Entities>) {
      for (const route of entities) {
        await client.get(`/${route}/sync-sequelize-model`).send();
      }
    }

    it('the match operator works for postgres connector', async function () {
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // extended operators are only supported in postgres
        //this test case should be skipped for sqlite3
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      } else {
        await migrateSchema(['roles']);
        const role1 = {
          permissions: ['Update', 'Create', 'Delete'],
          description: 'Admin',
        };
        await client.post('/role').send(role1);
        const role2 = {
          permissions: ['View'],
          description: 'Others',
        };
        await client.post('/role').send(role2);
        const filter = {
          where: {
            description: {match: 'Others'},
          } as AnyObject,
        };
        const roleByDesc = await client.get(
          `/roles?filter=${encodeURIComponent(JSON.stringify(filter))}`,
        );

        expect(roleByDesc.body).to.have.properties(
          'permissions',
          'description',
        );
        expect(roleByDesc.body.description).to.be.equal(role2.description);
      }
    });

    it('the contains operator works for postgres connector', async function () {
      if (primaryDataSourceConfig.connector === 'sqlite3') {
        // extended operators are only supported in postgres
        //this test case should be skipped for sqlite3
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.skip();
      } else {
        await migrateSchema(['roles']);
        const role1 = {
          permissions: ['Update', 'Create', 'Delete'],
          description: 'Admin',
        };
        await client.post('/role').send(role1);
        const role2 = {
          permissions: ['View'],
          description: 'Others',
        };
        await client.post('/role').send(role2);
        const filter = {
          where: {
            permissions: {contains: ['ViewTodo']},
          },
        } as AnyObject;
        const roleByDesc = await client.get(
          `/roles?filter=${encodeURIComponent(JSON.stringify(filter))}`,
        );

        expect(roleByDesc.body).to.have.properties(
          'permissions',
          'description',
        );
        expect(roleByDesc.body.description).to.be.equal(role2.description);
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
        'scoped-task.model',
        'task.model',
        'roles.model',
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
        'scoped-task.repository',
        'task.repository',
        'roles.repository',
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
        'scoped-task.controller',
        'roles.controller',
      ],
      observers: ['index', 'test.observer'],
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
    scopedTaskRepo = await app.getRepository(ScopedTaskRepository);
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
      phoneNumbers?: string[] | string;
    } & AnyObject;

    const user: DummyUser = {
      name: 'Foo',
      email: 'email@example.com',
      active: true,
      address: {city: 'Indore', zipCode: 452001},
      password: 'secret',
      dob: timestamp,
      phoneNumbers: ['+91 9876543210', '+91 1234567890'],
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
