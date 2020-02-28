// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {FindByTitleRepositoryMixin} from '../mixins/findByTitleRepoMixin';
import {DefaultCrudRepository, juggler} from '../../..';
import {Note, NoteRelations} from '../../fixtures/models/note.model';
import {Constructor} from '@loopback/core';

export class NoteRepository extends FindByTitleRepositoryMixin<
  Note,
  Constructor<
    DefaultCrudRepository<Note, typeof Note.prototype.id, NoteRelations>
  >
>(DefaultCrudRepository) {
  constructor(dataSource: juggler.DataSource) {
    super(Note, dataSource);
  }
}
