// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  EntityCrudRepository,
  juggler,
  ModelDefinition,
  repository,
  Repository,
} from '../../../';

class MyController {
  constructor(@repository('noteRepo') public noteRepo: Repository<Entity>) {}

  @repository('noteRepo')
  noteRepo2: Repository<Entity>;
}

describe('repository decorator', () => {
  let ctx: Context;
  let defaultRepo: Repository<Note>;
  let noteRepo: NoteRepository;
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

  class NoteRepository extends DefaultCrudRepository<Note, number> {
    constructor(dataSource: juggler.DataSource) {
      super(Note, dataSource);
    }
  }

  before(function() {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });

    defaultRepo = new DefaultCrudRepository(Note, ds);
    noteRepo = new NoteRepository(ds);
    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('datasources.memory').to(ds);
    ctx.bind('repositories.noteRepo').to(defaultRepo);
    ctx.bind(`repositories.${NoteRepository.name}`).to(noteRepo);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  it('supports referencing predefined repository by name via constructor', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo).exactly(defaultRepo);
  });

  it('supports referencing predefined repository by name via property', async () => {
    const myController = await ctx.get<MyController>(
      'controllers.MyController',
    );
    expect(myController.noteRepo2).exactly(defaultRepo);
  });

  it('throws not implemented for class-level @repository', () => {
    expect(() => {
      @repository('noteRepo')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Controller1 {}
    }).to.throw(/not implemented/);
  });

  it('supports @repository(model, dataSource) by names', async () => {
    class Controller2 {
      constructor(
        @repository('Note', 'memory') public repo: Repository<Note>,
      ) {}
    }
    ctx.bind('controllers.Controller2').toClass(Controller2);

    const myController = await ctx.get<Controller2>('controllers.Controller2');
    expect(myController.repo).to.be.not.null();
  });

  it('supports @repository(model, dataSource)', async () => {
    class Controller3 {
      constructor(
        @repository(Note, ds) public repo: EntityCrudRepository<Note, number>,
      ) {}
    }
    ctx.bind('controllers.Controller3').toClass(Controller3);
    const myController = await ctx.get<Controller3>('controllers.Controller3');
    const r = myController.repo;
    expect(r).to.be.instanceof(DefaultCrudRepository);
    expect((r as DefaultCrudRepository<Note, number>).dataSource).to.be.exactly(
      ds,
    );
  });

  it('rejects @repository("")', async () => {
    class Controller4 {
      constructor(@repository('') public repo: Repository<Note>) {}
    }
    ctx.bind('controllers.Controller4').toClass(Controller4);

    try {
      await ctx.get('controllers.Controller4');
      throw new Error('Repository resolver should have thrown an error.');
    } catch (err) {
      expect(err).to.match(/invalid repository/i);
    }
  });

  describe('@repository.getter() ', () => {
    it('accepts repository name', async () => {
      class TestController {
        constructor(
          @repository.getter('NoteRepository')
          public getRepo: Getter<NoteRepository>,
        ) {}
      }
      ctx.bind('TestController').toClass(TestController);

      const controller = await ctx.get<TestController>('TestController');
      const repoGetter = controller.getRepo;

      expect(repoGetter).to.be.a.Function();
      const repo = await repoGetter();
      expect(repo).to.be.exactly(noteRepo);
    });

    it('accepts repository class', async () => {
      class TestController {
        constructor(
          @repository.getter(NoteRepository)
          public getRepo: Getter<NoteRepository>,
        ) {}
      }
      ctx.bind('TestController').toClass(TestController);

      const controller = await ctx.get<TestController>('TestController');
      const repoGetter = controller.getRepo;

      expect(repoGetter).to.be.a.Function();
      const repo = await repoGetter();
      expect(repo).to.be.exactly(noteRepo);
    });
  });
});
