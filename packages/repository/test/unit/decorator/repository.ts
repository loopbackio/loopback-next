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
  /* tslint:disable-next-line:variable-name */
  let Note: typeof juggler.PersistedModel;
  let ds: juggler.DataSource;

  before(function() {
    ds = new DataSourceConstructor({
      name: 'db',
      connector: 'memory',
    });

    Note = ds.createModel<typeof juggler.PersistedModel>(
      'note',
      {title: 'string', content: 'string'},
      {},
    );
    repo = new DefaultCrudRepository(Note, ds);
    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('datasources.memory').to(ds);
    ctx.bind('repositories.noteRepo').to(repo);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via constructor', async () => {
    const myController: MyController = await ctx.get(
      'controllers.MyController',
    );
    expect(myController.noteRepo).exactly(repo);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via property', async () => {
    const myController: MyController = await ctx.get(
      'controllers.MyController',
    );
    expect(myController.noteRepo2).exactly(repo);
  });

  it('throws not implemented for class-level @repository', () => {
    expect(() => {
      @repository('noteRepo')
      class Controller1 {}
    }).to.throw(/not implemented/);
  });

  it('supports @repository(model, dataSource) by names', async () => {
    class Controller2 {
      constructor(@repository('Note', 'memory')
        public noteRepo: Repository<juggler.PersistedModel>) {}
    }
    ctx.bind('controllers.Controller2').toClass(Controller2);
    const myController: MyController = await ctx.get(
      'controllers.Controller2',
    );
    expect(myController.noteRepo).to.be.not.null();
  });

  it('supports @repository(model, dataSource)', async () => {
    class Controller3 {
      constructor(@repository(Note, ds)
        public noteRepo: Repository<juggler.PersistedModel>) {}
    }
    ctx.bind('controllers.Controller3').toClass(Controller3);
    const myController: MyController = await ctx.get(
      'controllers.Controller3',
    );
    expect(myController.noteRepo).to.be.not.null();
  });
});
