// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider, ValueOrPromise} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  juggler,
  ModelDefinition,
  Repository,
  repository,
} from '../../../';

class MyController {
  constructor(@repository('noteRepo') public noteRepo: Repository<Entity>) {}
}

class MyRepositoryProvider
  implements Provider<DefaultCrudRepository<Entity, string>> {
  constructor(
    @inject('models.Note') private myModel: typeof Entity,
    @inject('dataSources.memory') private dataSource: juggler.DataSource,
  ) {}

  value(): ValueOrPromise<DefaultCrudRepository<Entity, string>> {
    return new DefaultCrudRepository(this.myModel, this
      .dataSource as juggler.DataSource);
  }
}

describe('repository class', () => {
  let ctx: Context;

  before(function() {
    const ds = new juggler.DataSource({
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

  it('supports referencing predefined repository by name via constructor', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo instanceof DefaultCrudRepository).to.be.true();
  });
});
