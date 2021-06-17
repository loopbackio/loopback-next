// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  ExpressContext,
  field,
  GraphQLBindings,
  GraphQLMiddleware,
  GraphQLServer,
  ID,
  objectType,
  query,
  resolver,
} from '../..';

describe('GraphQL server', () => {
  let server: GraphQLServer;

  beforeEach(givenServer);

  it('registers resolver classes', () => {
    server.resolver(RecipeResolver);
    expect(server.getResolverClasses()).to.containEql(RecipeResolver);
  });

  it('registers resolver classes with name', () => {
    const binding = server.resolver(RecipeResolver, 'my-resolver');
    expect(binding.key).to.eql(`${GraphQLBindings.RESOLVERS}.my-resolver`);
  });

  it('registers middleware', async () => {
    const middleware: GraphQLMiddleware<ExpressContext> = (
      resolverData,
      next,
    ) => {
      return next();
    };
    server.middleware(middleware);
    const middlewareList = await server.getMiddlewareList();
    expect(middlewareList).to.containEql(middleware);
  });

  it('fails to start without resolvers', async () => {
    await expect(server.start()).to.be.rejectedWith(
      /Empty `resolvers` array property found in `buildSchema` options/,
    );
  });

  it('starts and stops', async () => {
    server.resolver(RecipeResolver);
    await server.start();
    expect(server.listening).to.be.true();
    await server.stop();
    expect(server.listening).to.be.false();
  });

  it('does not create http server with asMiddlewareOnly option', async () => {
    server = new GraphQLServer({asMiddlewareOnly: true});
    expect(server.httpServer).to.be.undefined();
  });

  function givenServer() {
    server = new GraphQLServer();
  }

  @objectType({description: 'Object representing cooking recipe'})
  class Recipe {
    @field(type => ID)
    id: string;

    @field()
    title: string;
  }

  @resolver(of => Recipe)
  class RecipeResolver {
    constructor() {}

    @query(returns => [Recipe])
    async recipes(): Promise<Recipe[]> {
      return [];
    }
  }
});
