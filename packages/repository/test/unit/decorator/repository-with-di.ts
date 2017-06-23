// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject} from '@loopback/context';

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

    class MyRepository extends DefaultCrudRepository<Entity, string> {
      constructor(
        @inject('models.Note') myModel: typeof juggler.PersistedModel,
        // FIXME For some reason ts-node fails by complaining that
        // juggler is undefined if the following is used:
        // @inject('dataSources.memory') dataSource: juggler.DataSource
        // tslint:disable-next-line:no-any
        @inject('dataSources.memory') dataSource: any) {
        super(myModel, dataSource);
      }
    }
    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('dataSources.memory').to(ds);
    ctx.bind('repositories.noteRepo').toClass(MyRepository);
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
