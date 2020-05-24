// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {sortListOfGroups} from '../../';

describe('sortGroups', () => {
  it('sorts groups across lists', () => {
    const result = sortListOfGroups(['first', 'end'], ['start', 'end', 'last']);
    expect(result).to.eql(['first', 'start', 'end', 'last']);
  });

  it('add new groups after existing groups', () => {
    const result = sortListOfGroups(
      ['initial', 'session', 'auth'],
      ['initial', 'added', 'auth'],
    );
    expect(result).to.eql(['initial', 'session', 'added', 'auth']);
  });

  it('merges arrays preserving the order', () => {
    const target = ['initial', 'session', 'auth', 'routes', 'files', 'final'];
    const result = sortListOfGroups(target, [
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
      'session',
      'postinit',
      'preauth',
      'auth',
      'routes',
      'files',
      'subapps',
      'final',
      'last',
    ]);
  });

  it('throws on conflicting order', () => {
    expect(() => {
      sortListOfGroups(['one', 'two'], ['two', 'one']);
    }).to.throw(/Cyclic dependency/);
  });
});
