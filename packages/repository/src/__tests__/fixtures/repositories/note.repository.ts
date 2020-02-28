// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository, juggler} from '../../..';
import {FindByTitleRepositoryMixin} from '../mixins/find-by-title-repo-mixin';
import {Note} from '../models/note.model';

export class NoteRepository extends FindByTitleRepositoryMixin<Note>(
  DefaultCrudRepository,
) {
  constructor(dataSource: juggler.DataSource) {
    super(Note, dataSource);
  }
}
