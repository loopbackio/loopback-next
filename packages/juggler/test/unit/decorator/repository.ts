// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { expect } from '@loopback/testlab';
import { Context } from '@loopback/context';
import { repository } from '../../../src/decorator';

import { AnyType } from '../../../src/common';
import { Repository } from '../../../src/repository';
import { jugglerModule, bindModel, DataSource, juggler, DefaultCrudRepository }
  from '../../../src/legacy';

class MyController {
  constructor(@repository('noteRepo') public noteRepo: Repository<AnyType>) {
  }
}

describe('@repository', () => {
  let ctx: Context;
  let repo: Repository<AnyType>;

  before(function() {
    const ds: juggler.DataSource = new DataSource({
      name: 'db',
      connector: 'memory',
    });

    /* tslint:disable:variable-name */
    const Note = <typeof juggler.PersistedModel>
      ds.createModel('note', { title: 'string', content: 'string' }, {});
    repo = new DefaultCrudRepository(Note, ds);
    ctx = new Context();
    ctx.bind('repositories:noteRepo').to(repo);
    ctx.bind('controllers:MyController').toClass(MyController);
  });

  it('supports referencing predefined repository by name', async () => {
    const myController: MyController = await ctx.get('controllers:MyController');
    expect(myController.noteRepo).exactly(repo);
  });
});
