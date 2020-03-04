// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  TestSandbox,
} from '@loopback/testlab';
import {resolve} from 'path';
import {TypeOrmApp} from '../fixtures/application';

describe('REST with TypeORM (integration)', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  let app: TypeOrmApp;
  let client: Client;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getAppAndClient);
  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  it('creates an entity', async () => {
    const book = {
      title: 'The Jungle',
      published: false,
    };
    const res = await client.post('/books').send(book);
    expect(res.body).to.have.property('title', book.title);
    expect(res.body).to.have.property('published', book.published);
  });

  it('fetches an entity', async () => {
    const book = {
      title: 'The Book',
      published: true,
    };
    const create = await client.post('/books').send(book);
    const res = await client.get(`/books/${create.body.id}`);
    expect(res.body).to.have.property('title', book.title);
    expect(res.body).to.have.property('published', book.published);
  });

  async function getAppAndClient() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(
        __dirname,
        '../fixtures/typeorm-connections/sqlite.connection.js',
      ),
      'typeorm-connections/sqlite.connection.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/typeorm-entities/book.entity.js'),
      'typeorm-entities/book.entity.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/controllers/book.controller.js'),
      'controllers/book.controller.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).TypeOrmApp;
    app = new MyApp({
      rest: givenHttpServerConfig(),
    });

    await app.boot();
    await app.start();

    client = createRestAppClient(app as RestApplication);
  }
});
