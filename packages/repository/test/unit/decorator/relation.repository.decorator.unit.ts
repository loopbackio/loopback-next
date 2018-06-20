// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  DefaultCrudRepository,
  hasManyRepository,
  juggler,
  EntityCrudRepository,
  constrainRepositoryFunction,
  getConstrainedRepositoryFunction,
  model,
  hasMany,
  property,
  repository,
} from '../../../src';
import {DataSource} from 'loopback-datasource-juggler';
import {Context, inject} from '@loopback/context';

describe('hasManyRepository decorator', () => {
  let ctx: Context;
  let ds: DataSource;
  let webPageRepo: WebPageRepository;
  let linkRepo: LinkRepository;
  let expectedFn: constrainRepositoryFunction<Link>;

  before(async function() {
    ds = new DataSource({
      name: 'db',
      connector: 'memory',
    });

    ctx = new Context();
    ctx.bind('datasources.memory').to(ds);
    ctx.bind('repositories.LinkRepository').toClass(LinkRepository);
    ctx.bind('repositories.WebPageRepository').toClass(WebPageRepository);

    await givenFactoryFn();
  });

  it('injects constrained repo function via constructor', async () => {
    const repo = await ctx.get<WebPageRepository>(
      'repositories.WebPageRepository',
    );

    expect(repo.links).deepEqual(expectedFn);
  });

  @model()
  class Link extends Entity {
    @property({id: true})
    id: number;
    @property() url: string;
  }

  @model()
  class WebPage extends Entity {
    @property({id: true})
    id: number;
    @property() title: string;
    @hasMany() links: Link[];
  }

  class LinkRepository extends DefaultCrudRepository<
    Link,
    typeof Link.prototype.id
  > {
    constructor(@inject('datasources.memory') protected db: DataSource) {
      super(Link, db);
    }
  }

  class WebPageRepository extends DefaultCrudRepository<
    WebPage,
    typeof WebPage.prototype.id
  > {
    constructor(
      @inject('datasources.memory') protected db: DataSource,
      @hasManyRepository(LinkRepository)
      public readonly links: constrainRepositoryFunction<Link>,
    ) {
      super(WebPage, db);
    }
  }

  async function givenLinkRepositoryInstance(): Promise<LinkRepository> {
    return await ctx.get<LinkRepository>('repositories.LinkRepository');
  }

  async function givenFactoryFn() {
    const linkRepoInstance = await givenLinkRepositoryInstance();
    expectedFn = getConstrainedRepositoryFunction(WebPage, linkRepoInstance);
  }
});
