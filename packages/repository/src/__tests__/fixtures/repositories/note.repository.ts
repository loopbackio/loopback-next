// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '../../..';
import {FindByTitleRepositoryMixin} from '../mixins/find-by-title-repo-mixin';
import {Note, NoteRelations} from '../models/note.model';

/**
 * A repository for `Note` with `findByTitle`
 */
export class NoteRepository extends FindByTitleRepositoryMixin<
  Note,
  Constructor<
    DefaultCrudRepository<Note, typeof Note.prototype.id, NoteRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    dataSource: juggler.DataSource = new juggler.DataSource({
      connector: 'memory',
    }),
  ) {
    super(Note, dataSource);
  }
}
