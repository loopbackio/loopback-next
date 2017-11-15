// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  repository,
  juggler,
  Entity,
  EntityCrudRepository,
  DefaultCrudRepository,
} from '@loopback/repository';

import {EntityCrudController} from '../..';
import {ApplicationConfig, Application} from '@loopback/core';
import {RestApplication, RestServer, api} from '@loopback/rest';
import {createClientForHandler, supertest} from '@loopback/testlab';
import {model, property} from '@loopback/repository';

describe('Repository based controller', () => {
  let app: Application;
  let server: RestServer;
  let client: supertest.SuperTest<supertest.Test>;

  // The Controller for Note
  @api({basePath: '/notes', paths: {}})
  class NoteController extends EntityCrudController<Entity, number> {
    constructor(
      @repository('noteRepo') noteRepo: EntityCrudRepository<Entity, number>,
    ) {
      super(noteRepo);
    }
  }

  const ds: juggler.DataSource = new juggler.DataSource({
    name: 'db',
    connector: 'memory',
  });

  @model()
  class Note extends Entity {
    @property({id: true})
    id: number;
    @property()
    title: string;
    @property()
    content: string;
    /*
    static definition = new ModelDefinition({
      name: 'note',
      properties: {
        id: {type: 'number', id: true},
        title: 'string',
        content: 'string',
      },
    });
    */
  }

  async function setup() {
    server = await createServer({rest: {port: 0}});

    // Mock up a predefined repository
    const repo = new DefaultCrudRepository(Note, ds);

    // Bind the repository instance
    server.bind('repositories.noteRepo').to(repo);

    // Bind the controller class
    app.controller(NoteController);

    // Create some notes
    await repo.create({title: 't1', content: 'Note 1'});
    await repo.create({title: 't2', content: 'Note 2'});

    await server.start();
  }

  async function createServer(options?: ApplicationConfig) {
    app = new RestApplication(options);
    return await app.getServer(RestServer);
  }

  before(setup);

  before(() => {
    client = createClientForHandler(server.requestHandler);
  });

  after(async () => {
    await server.stop();
  });

  it('exposes GET /notes', async () => {
    await client
      .get('/notes')
      .expect('Content-Type', 'application/json')
      .expect(200, [
        {id: 1, title: 't1', content: 'Note 1'},
        {id: 2, title: 't2', content: 'Note 2'},
      ]);
  });

  it('exposes GET /notes/{id}', async () => {
    await client
      .get('/notes/1')
      .expect(200, {id: 1, title: 't1', content: 'Note 1'});
  });

  it('exposes GET /notes/{id}/exists', async () => {
    await client.get('/notes/1/exists').expect(200, 'true');
  });

  it('exposes GET /notes/count', async () => {
    await client.get('/notes/count').expect(200, '2');
  });
});
