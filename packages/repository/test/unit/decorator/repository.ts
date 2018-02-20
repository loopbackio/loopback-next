// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context} from '@loopback/context';
import {repository} from '../../../';

import {Repository} from '../../../';
import {
  DataSourceConstructor,
  juggler,
  DefaultCrudRepository,
  Entity,
  ModelDefinition,
} from '../../../';

class MyController {
  constructor(@repository('noteRepo') public noteRepo: Repository<Entity>) {}

  @repository('noteRepo') noteRepo2: Repository<Entity>;
}

describe('repository decorator', () => {
  let ctx: Context;
  let repo: Repository<Note>;
  let ds: juggler.DataSource;

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

  before(function() {
    ds = new DataSourceConstructor({
      name: 'db',
      connector: 'memory',
    });

    repo = new DefaultCrudRepository(Note, ds);
    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('datasources.memory').to(ds);
    ctx.bind('repositories.noteRepo').to(repo);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via constructor', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo).exactly(repo);
  });

  // tslint:disable-next-line:max-line-length
  it('supports referencing predefined repository by name via property', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo2).exactly(repo);
  });

  it('throws not implemented for class-level @repository', () => {
    expect(() => {
      @repository('noteRepo')
      // tslint:disable-next-line:no-unused-variable
      class Controller1 {}
    }).to.throw(/not implemented/);
  });

  it('supports @repository(model, dataSource) by names', async () => {
    class Controller2 {
      constructor(
        @repository('Note', 'memory')
        public noteRepo: Repository<Note>,
      ) {}
    }
    ctx.bind('controllers.Controller2').toClass(Controller2);

    const myController = await ctx.get<MyController>('controllers.Controller2');
    expect(myController.noteRepo).to.be.not.null();
  });

  it('supports @repository(model, dataSource)', async () => {
    class Controller3 {
      constructor(
        @repository(Note, ds)
        public noteRepo: Repository<Note>,
      ) {}
    }
    ctx.bind('controllers.Controller3').toClass(Controller3);
    const myController = await ctx.get<MyController>('controllers.Controller3');
    expect(myController.noteRepo).to.be.not.null();
  });

  it('rejects @repository("")', async () => {
    class Controller4 {
      constructor(@repository('') public noteRepo: Repository<Note>) {}
    }
    ctx.bind('controllers.Controller4').toClass(Controller4);

    try {
      await ctx.get('controllers.Controller4');
      throw new Error('Repository resolver should have thrown an error.');
    } catch (err) {
      expect(err).to.match(/invalid repository/i);
    }
  });
});
