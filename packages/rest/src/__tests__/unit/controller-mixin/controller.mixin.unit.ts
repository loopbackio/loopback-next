// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  groceryNote,
  NoteController,
} from '../../fixtures/controllers/note.controller';
import {Note} from '../../fixtures/models/note.model';

describe('add method to controller via mixin', () => {
  let controller: NoteController;

  before(async () => {
    controller = new NoteController();
  });

  it(`non mixin method 'create' exists`, () => {
    expect('create' in controller).to.be.True();
    expect(typeof controller.findByTitle === 'function').to.be.True();
  });

  it(`mixin method 'findByTitle' exists`, async () => {
    expect('findByTitle' in controller).to.be.True();
    expect(typeof controller.findByTitle === 'function').to.be.True();
    const foundNote: Note[] = await controller.findByTitle('groceries');
    expect(foundNote.length).to.equal(1);
    expect(groceryNote).to.deepEqual(foundNote[0]);
  });
});
