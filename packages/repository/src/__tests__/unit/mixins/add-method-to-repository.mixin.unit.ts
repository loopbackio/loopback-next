// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Note} from '../../fixtures/models/note.model';
import {NoteRepository} from '../../fixtures/repositories/note.repository';

describe('add method to crud repository via mixin', () => {
  let repo: NoteRepository;
  const noteData = {
    title: 'groceries',
    content: 'eggs,bacon',
    category: 'keto',
  };
  let note: Note;

  beforeEach(async () => {
    repo = new NoteRepository();
  });

  // method from CrudRepository
  it(`non-mixin method 'create' exists`, async () => {
    note = await repo.create(new Note(noteData));
    expect(note.toJSON()).to.deepEqual({id: 1, ...noteData});
  });

  // method from EntityCrudRepository
  it(`non-mixin method 'findById' exists`, async () => {
    note = await repo.create(new Note(noteData));
    const foundNote: Note = await repo.findById(note.id);
    expect(foundNote).to.deepEqual(note);
  });

  // method from mixin
  it(`mixin method 'findByTitle' exists`, async () => {
    note = await repo.create(
      new Note({title: 'groceries', content: 'eggs,bacon', category: 'keto'}),
    );
    const foundNotes: Note[] = await repo.findByTitle('groceries');
    expect(foundNotes).to.deepEqual([note]);
  });
});
