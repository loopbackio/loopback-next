// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context} from '@loopback/context';
import {repository} from '../../../';

import {Repository} from '../../../';
import {
  jugglerModule,
  bindModel,
  DataSourceConstructor,
  juggler,
  DefaultCrudRepository,
} from '../../../';

class MyController {
  constructor(
    @repository('noteRepo') public noteRepo: Repository<juggler.PersistedModel>,
  ) {}

  @repository('noteRepo') noteRepo2: Repository<juggler.PersistedModel>;
}

describe('repository decorator', () => {
  let ctx: Context;
  let repo: Repository<juggler.PersistedModel>;

  before(function() {
    const ds: juggler.DataSource = new DataSourceConstructor({
      name: 'db',
      connector: 'memory',
    });

    /* tslint:disable-next-line:variable-name */
    const Note = ds.createModel<typeof juggler.PersistedModel>(
      'note',
      {title: 'string', content: 'string'},
      {},
    );
    repo = new DefaultCrudRepository(Note, ds);
    ctx = new Context();
    ctx.bind('repositories:noteRepo').to(repo);
    ctx.bind('controllers:MyController').toClass(MyController);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via constructor', async () => {
    const myController: MyController = await ctx.get(
      'controllers:MyController',
    );
    expect(myController.noteRepo).exactly(repo);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via property', async () => {
    const myController: MyController = await ctx.get(
      'controllers:MyController',
    );
    expect(myController.noteRepo2).exactly(repo);
  });

  it('throws not implemented for class-level @repository', () => {
    expect(() => {
      @repository('noteRepo')
      class Controller1 {}
    }).to.throw(/not implemented/);
  });

  it('throws not implemented for @repository(model, dataSource)', () => {
    expect(() => {
      class Controller2 {
        constructor(
          @repository('customer', 'mysql')
          public noteRepo: Repository<juggler.PersistedModel>,
        ) {}
      }
    }).to.throw(/not implemented/);
  });
});
