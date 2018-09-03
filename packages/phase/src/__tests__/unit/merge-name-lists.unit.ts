// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {mergePhaseNameLists} from '../../merge-name-lists';
import {expect} from '@loopback/testlab';

describe('mergePhaseNameLists', () => {
  it('starts adding new phases from the start', () => {
    const result = mergePhaseNameLists(
      ['start', 'end'],
      ['first', 'end', 'last'],
    );
    expect(result).to.eql(['first', 'start', 'end', 'last']);
  });

  it('prioritizes new phases before existing phases', () => {
    const result = mergePhaseNameLists(
      ['initial', 'session', 'auth'],
      ['initial', 'added', 'auth'],
    );
    expect(result).to.eql(['initial', 'added', 'session', 'auth']);
  });

  it('merges arrays preserving the order', () => {
    const target = ['initial', 'session', 'auth', 'routes', 'files', 'final'];
    const result = mergePhaseNameLists(target, [
      'initial',
      'postinit',
      'preauth', // add
      'auth',
      'routes',
      'subapps', // add
      'final',
      'last', // add
    ]);

    expect(result).to.eql([
      'initial',
      'postinit',
      'preauth', // new
      'session',
      'auth',
      'routes',
      'subapps', // new
      'files',
      'final',
      'last', // new
    ]);
  });

  it('throws on conflicting order', () => {
    expect(() => {
      mergePhaseNameLists(['one', 'two'], ['two', 'one']);
    }).to.throw(/cannot add "one" after "two"/);
  });
});
