// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {NoteRepository} from '../../fixtures/repositories/note.repository';
import {DataSource} from 'loopback-datasource-juggler';

describe('add method to crud repository via mixin', () => {
  let ds: DataSource;
  let repo: NoteRepository;

  before(async () => {
    ds = new DataSource({
      connector: 'memory',
    });
    repo = new NoteRepository(ds);
  });

  it('non-mixin methods exist', () => {
    const crudMethods = [
      'create',
      'createAll',
      'find',
      'updateAll',
      'deleteAll',
      'count',
      'save',
      'update',
      'delete',
      'findById',
      'updateById',
      'replaceById',
      'deleteById',
      'exists',
    ];
    const methodsFound = crudMethods.filter(methodName => {
      return methodName in repo;
    });
    expect(crudMethods.length).to.be.equal(methodsFound.length);
  });

  it(`mixin method 'findByTitle' exists`, () => {
    expect('findByTitle' in repo).to.be.True();
    expect(typeof repo.findByTitle === 'function').to.be.True();
  });
});
