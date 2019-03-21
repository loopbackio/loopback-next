// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createRestAppClient} from '@loopback/testlab';
import {GraphQLServer} from '../../graphql-server';
import {main} from './application';

describe('GraphQL integration', () => {
  let server: GraphQLServer;

  before(givenServer);
  after(stopServer);

  it('starts graphql server', async () => {
    const client = createRestAppClient({
      restServer: {url: server.httpServer.url},
    });
    const expectedData = {
      data: {
        recipe: {
          title: 'Recipe 1',
          description: 'Desc 1',
          ratings: [0, 3, 1],
          creationDate: '2018-04-11T00:00:00.000Z',
          ratingsCount: 1,
          averageRating: 1.3333333333333333,
        },
      },
    };
    await client
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipe1', variables: {}, query: example})
      .expect(200, expectedData);
  });

  async function givenServer() {
    server = await main({port: 0, host: '127.0.0.1'});
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
  }
});

const example = `query GetRecipe1 {
  recipe(title: "Recipe 1") {
    title
    description
    ratings
    creationDate
    ratingsCount(minRate: 2)
    averageRating
  }
}

query GetRecipes {
  recipes {
    title
    description
    creationDate
    averageRating
  }
}

mutation AddRecipe {
  addRecipe(recipe: {
    title: "New recipe"
    description: "Simple description"
  }) {
    creationDate
  }
}`;
