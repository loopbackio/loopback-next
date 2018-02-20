// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, Provider, ValueOrPromise} from '@loopback/context';

import {
  Repository,
  Entity,
  repository,
  DataSourceConstructor,
  DataSourceType,
  DefaultCrudRepository,
  ModelDefinition,
} from '../../../';

class MyController {
  constructor(@repository('noteRepo') public noteRepo: Repository<Entity>) {}
}

class MyRepositoryProvider
  implements Provider<DefaultCrudRepository<Entity, string>> {
  constructor(
    @inject('models.Note') private myModel: typeof Entity,
    @inject('dataSources.memory') private dataSource: DataSourceType,
  ) {}

  value(): ValueOrPromise<DefaultCrudRepository<Entity, string>> {
    return new DefaultCrudRepository(this.myModel, this
      .dataSource as DataSourceType);
  }
}

describe('repository class', () => {
  let ctx: Context;

  before(function() {
    const ds = new DataSourceConstructor({
      name: 'db',
      connector: 'memory',
    });

    class Note extends Entity {
      static definition = new ModelDefinition({
        name: 'note',
        properties: {
          title: 'string',
          content: 'string',
          id: {type: 'number', id: true},
        },
      });
    }

    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('dataSources.memory').to(ds);
    ctx.bind('repositories.noteRepo').toProvider(MyRepositoryProvider);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via constructor', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo instanceof DefaultCrudRepository).to.be.true();
  });
});
