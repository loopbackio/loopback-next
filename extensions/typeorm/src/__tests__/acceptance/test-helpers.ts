// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, extensionFor} from '@loopback/core';
import {expect} from '@loopback/testlab';
import path from 'path';
import {Connection, Repository} from 'typeorm';
import {SqliteConnectionOptions} from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import {typeorm, TypeOrmBindings, TypeOrmComponent} from '../..';
import {CONNECTION_OPTIONS_EXTENSION_POINT} from '../../keys';
import {Product} from '../fixtures/product';
import {User} from '../fixtures/user';
const productEntity = require.resolve('../fixtures/product');

export const SQLLITE_CONNECTION: SqliteConnectionOptions = {
  type: 'sqlite',
  database: path.join(__dirname, 'sqlite-test-db'),
  entities: [User, productEntity],
  synchronize: true,
};

export class DBHelperWithConnection {
  @typeorm.connection() private connection: Connection;

  async writeAndReadUser() {
    const repo = this.connection.getRepository(User);
    await testUser(repo);
  }

  async writeAndReadProduct() {
    const repo = this.connection.getRepository(Product);
    await testProduct(repo);
  }
}

export class DBHelperWithRepository {
  @typeorm.repository(User) private userRepo: Repository<User>;
  @typeorm.repository(Product) private productRepo: Repository<Product>;

  async writeAndReadUser() {
    await testUser(this.userRepo);
  }

  async writeAndReadProduct() {
    await testProduct(this.productRepo);
  }
}

export async function givenAppWithCustomConfig() {
  const app = new Application();
  app.configure(TypeOrmBindings.COMPONENT).to(SQLLITE_CONNECTION);
  app.component(TypeOrmComponent);
  await app.start();
  return app;
}

export async function givenAppWithExtensionPoint() {
  const app = new Application();
  app
    .bind('typeorm.connectionOptions.sqllite')
    .to(SQLLITE_CONNECTION)
    .apply(extensionFor(CONNECTION_OPTIONS_EXTENSION_POINT));
  app.component(TypeOrmComponent);
  await app.start();
  return app;
}

async function testProduct(repo: Repository<Product>) {
  await repo.clear();
  const result = await repo.insert({
    name: 'iPhoneX',
    description: 'Apple iPhone X',
  });
  const products = await repo.find();
  expect(products.length).to.equal(1);
  const product = repo.create({
    id: result.identifiers[0].id,
    name: 'iPhoneX',
    description: 'Apple iPhone X',
  });
  expect(products[0]).to.eql(product);
}

async function testUser(repo: Repository<User>) {
  await repo.clear();
  const result = await repo.insert({
    firstName: 'John',
    lastName: 'Smith',
    isActive: true,
  });
  const users = await repo.find();
  expect(users.length).to.equal(1);
  const user = repo.create({
    id: result.identifiers[0].id,
    firstName: 'John',
    lastName: 'Smith',
    isActive: true,
  });
  expect(users[0]).to.eql(user);
}

export function runTest(title: string, getApp: () => Promise<Application>) {
  describe(`TypeOrm ${title} (acceptance)`, () => {
    let app: Application;

    after(async () => {
      if (app) await app.stop();
      (app as unknown) = undefined;
    });

    before(async () => {
      app = await getApp();
    });

    it('starts TypeOrmComponent', async () => {
      const connectionManager = await app.get(
        TypeOrmBindings.CONNECTION_MANAGER,
      );
      if (connectionManager.typeOrmConfig) {
        expect(connectionManager.typeOrmConfig).to.eql(SQLLITE_CONNECTION);
      } else {
        const options = await connectionManager.getConnectionOptions();
        expect(options).to.eql([SQLLITE_CONNECTION]);
      }
      expect(connectionManager.connectionManager.connections.length).to.eql(1);
    });

    it('allows injection of connection', async () => {
      app.bind('dbConnectionHelper').toClass(DBHelperWithConnection);
      const dbHelper: DBHelperWithConnection = await app.get(
        'dbConnectionHelper',
      );
      await dbHelper.writeAndReadUser();
      await dbHelper.writeAndReadProduct();
    });

    it('allows injection of repository', async () => {
      app.bind('dbRepositoryHelper').toClass(DBHelperWithRepository);
      const dbHelper: DBHelperWithRepository = await app.get(
        'dbRepositoryHelper',
      );
      await dbHelper.writeAndReadUser();
      await dbHelper.writeAndReadProduct();
    });
  });
}
