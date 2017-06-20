// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, Provider, ValueOrPromise} from '@loopback/context';

import {
  Repository,
  Entity,
  repository,
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
}

class MyRepositoryProvider implements
  Provider<DefaultCrudRepository<Entity, string>> {
  constructor(
    @inject('models.Note') private myModel: typeof juggler.PersistedModel,
    // FIXME For some reason ts-node fails by complaining that
    // juggler is undefined if the following is used:
    // @inject('dataSources.memory') dataSource: juggler.DataSource
    // tslint:disable-next-line:no-any
    @inject('dataSources.memory') private dataSource: any) {}

  value(): ValueOrPromise<DefaultCrudRepository<Entity, string>> {
    return new DefaultCrudRepository(
      this.myModel,
      this.dataSource as juggler.DataSource,
      );
  }
}

describe('repository class', () => {
  let ctx: Context;

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

    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('dataSources.memory').to(ds);
    ctx.bind('repositories.noteRepo').toProvider(MyRepositoryProvider);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via constructor', async () => {
    const myController: MyController = await ctx.get(
      'controllers.MyController',
    );
    expect(myController.noteRepo instanceof DefaultCrudRepository).to.be.true();
  });

});
