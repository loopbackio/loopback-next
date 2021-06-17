// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, supertest} from '@loopback/testlab';

export function runTests(getClient: () => supertest.SuperTest<supertest.Test>) {
  it('gets a recipe by id', async () => {
    const expectedData = {
      data: {
        recipe: {
          title: 'Recipe 1',
          description: 'Desc 1',
          ratings: [0, 3, 1],
          creationDate: '2018-04-11T00:00:00.000Z',
          ratingsCount: 1,
          averageRating: 1.3333333333333333,
          ingredients: ['one', 'two', 'three'],
          numberInCollection: 1,
        },
      },
    };
    await getClient()
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipe1', variables: {}, query: exampleQuery})
      .expect(200, expectedData);
  });

  it('adds a recipe', async () => {
    const res = await getClient()
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'AddRecipe', variables: {}, query: exampleQuery})
      .expect(200);
    expect(res.body.data.addRecipe).to.containEql({
      id: '4',
      numberInCollection: 4,
    });
  });

  it('gets recipes', async () => {
    const expectedRecipes = [
      {
        title: 'Recipe 1',
        description: 'Desc 1',
        creationDate: '2018-04-11T00:00:00.000Z',
        averageRating: 1.3333333333333333,
        ingredientsLength: 3,
        numberInCollection: 1,
      },
      {
        title: 'Recipe 2',
        description: 'Desc 2',
        creationDate: '2018-04-15T00:00:00.000Z',
        averageRating: 2.5,
        ingredientsLength: 3,
        numberInCollection: 2,
      },
      {
        title: 'Recipe 3',
        description: null,
        creationDate: '2020-05-24T00:00:00.000Z',
        averageRating: 4.5,
        ingredientsLength: 3,
        numberInCollection: 3,
      },
      {
        title: 'New recipe',
        description: 'Simple description',
        creationDate: '2020-05-24T00:00:00.000Z',
        averageRating: 3,
        ingredientsLength: 3,
        numberInCollection: 4,
      },
    ];
    const res = await getClient()
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipes', variables: {}, query: exampleQuery})
      .expect(200);
    expect(res.body.data.recipes).to.eql(expectedRecipes);
  });
}

export const exampleQuery = `query GetRecipe1 {
  recipe(recipeId: "1") {
    title
    description
    ratings
    creationDate
    ratingsCount(minRate: 2)
    averageRating
    ingredients
    numberInCollection
  }
}

query GetRecipes {
  recipes {
    title
    description
    creationDate
    averageRating
    ingredientsLength
    numberInCollection
  }
}

mutation AddRecipe {
  addRecipe(recipe: {
    title: "New recipe"
    description: "Simple description",
    ingredients: [
      "One",
      "Two",
      "Three",
    ],
  }) {
    id
    numberInCollection
    creationDate
  }
}

subscription AllNotifications {
  recipeCreated {
    id
    numberInCollection
    creationDate
  }
}
`;
