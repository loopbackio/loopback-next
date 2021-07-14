// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  juggler,
  ModelDefinition,
  Repository,
  repository,
} from '../../../';

describe('repository class', () => {
  let ctx: Context;

  before(givenCtx);

  it('supports referencing predefined repository by name via constructor', async () => {
    const myController = await ctx.get<StringBoundController>(
      'controllers.StringBoundController',
    );
    expect(myController.noteRepo instanceof DefaultCrudRepository).to.be.true();
  });

  it('supports referencing predefined repository via constructor', async () => {
    const myController = await ctx.get<RepositoryBoundController>(
      'controllers.RepositoryBoundController',
    );
    expect(myController.noteRepo instanceof DefaultCrudRepository).to.be.true();
  });

  const ds: juggler.DataSource = new juggler.DataSource({
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
      @inject('dataSources.memory') dataSource: juggler.DataSource,
    ) {
      super(myModel, dataSource);
    }
  }

  class StringBoundController {
    constructor(
      @repository('MyRepository') public noteRepo: Repository<Entity>,
    ) {}
  }

  class RepositoryBoundController {
    constructor(
      @repository(MyRepository) public noteRepo: Repository<Entity>,
    ) {}
  }

  function givenCtx() {
    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('dataSources.memory').to(ds);
    ctx.bind('repositories.MyRepository').toClass(MyRepository);
    ctx
      .bind('controllers.StringBoundController')
      .toClass(StringBoundController);
    ctx
      .bind('controllers.RepositoryBoundController')
      .toClass(RepositoryBoundController);
  }
});
