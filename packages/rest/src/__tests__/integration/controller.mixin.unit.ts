// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {Client, createClientForHandler, expect} from '@loopback/testlab';
import {HttpServerLike, RestComponent, RestServer} from '../..';
import {NoteController} from '../fixtures/controllers/note.controller';
import {Note} from '../fixtures/models/note.model';
import {
  NoteRepository,
  NOTE_REPO_BINDING_KEY,
} from '../fixtures/repositories/note.repository';

describe('add method to controller via mixin', () => {
  let controller: NoteController;

  const noteData = {
    title: 'groceries',
    content: 'eggs,bacon',
  };

  const expectedNote = new Note({
    id: 1,
    ...noteData,
  });

  it(`non-mixin method 'create' exists`, async () => {
    givenController();
    const note: Note = await givenNewNote();
    expect(note).to.deepEqual(expectedNote);
  });

  it(`mixin method 'findByTitle' exists`, async () => {
    givenController();
    await givenNewNote();
    const foundNote: Note[] = await controller.findByTitle('groceries');
    expect(foundNote).to.deepEqual([expectedNote]);
  });

  it('mixin endpoint /notes/findByTitle reachable', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

    await whenIMakeRequestTo(server)
      .post('/notes')
      .send(noteData)
      .expect(200, expectedNote.toJSON());

    return whenIMakeRequestTo(server)
      .get('/notes/findByTitle/groceries')
      .expect(200, JSON.stringify([expectedNote]));
  });

  function givenAnApplication() {
    const app = new Application();
    app.component(RestComponent);
    app.bind(NOTE_REPO_BINDING_KEY).to(new NoteRepository());
    app.controller(NoteController);
    return app;
  }

  async function givenAServer(app: Application) {
    return app.getServer(RestServer);
  }

  function whenIMakeRequestTo(serverOrApp: HttpServerLike): Client {
    return createClientForHandler(serverOrApp.requestHandler);
  }

  async function givenNewNote() {
    return controller.create(new Note(noteData));
  }

  function givenController() {
    controller = new NoteController();
  }
});
