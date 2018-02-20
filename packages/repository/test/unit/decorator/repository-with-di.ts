// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject} from '@loopback/context';

import {
  Repository,
  Entity,
  repository,
  DataSourceConstructor,
  DefaultCrudRepository,
  ModelDefinition,
  DataSourceType,
} from '../../../';

class MyController {
  constructor(@repository('noteRepo') public noteRepo: Repository<Entity>) {}
}

describe('repository class', () => {
  let ctx: Context;

  before(function() {
    const ds: DataSourceType = new DataSourceConstructor({
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

      title: string;
      content: string;

      constructor(data?: Partial<Note>) {
        super(data);
      }
    }

    class MyRepository extends DefaultCrudRepository<Entity, string> {
      constructor(
        @inject('models.Note') myModel: typeof Note,
        @inject('dataSources.memory') dataSource: DataSourceType,
      ) {
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
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo instanceof DefaultCrudRepository).to.be.true();
  });
});
