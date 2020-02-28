// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {NoteController} from '../../fixtures/controllers/note.controller';

describe('add method to controller via mixin', () => {
  let controller: NoteController;

  before(async () => {
    controller = new NoteController();
  });

  it('non-mixin methods exist', () => {
    const methods = [
      'create',
      'count',
      'find',
      'updateAll',
      'findById',
      'updateById',
      'replaceById',
      'deleteById',
    ];

    const methodsFound = methods.filter(methodName => {
      return methodName in controller;
    });
    expect(methods.length).to.be.equal(methodsFound.length);
  });

  it(`mixin method 'findByTitle' exists`, () => {
    expect('findByTitle' in controller).to.be.True();
    expect(typeof controller.findByTitle === 'function').to.be.True();
  });
});
