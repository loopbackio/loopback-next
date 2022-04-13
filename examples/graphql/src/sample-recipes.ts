// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {plainToClass} from 'class-transformer';
import {Recipe} from './graphql-types/recipe-type';

export const sampleRecipes = [
  createRecipe({
    id: '1',
    title: 'Recipe 1',
    description: 'Desc 1',
    ingredients: ['one', 'two', 'three'],
    ratings: [0, 3, 1],
    creationDate: new Date('2018-04-11'),
  }),
  createRecipe({
    id: '2',
    title: 'Recipe 2',
    description: 'Desc 2',
    ingredients: ['four', 'five', 'six'],
    ratings: [4, 2, 3, 1],
    creationDate: new Date('2018-04-15'),
  }),
  createRecipe({
    id: '3',
    title: 'Recipe 3',
    ingredients: ['seven', 'eight', 'nine'],
    ratings: [5, 4],
    creationDate: new Date('2020-05-24'),
  }),
];

function createRecipe(recipeData: Partial<Recipe>): Recipe {
  return plainToClass(Recipe, recipeData);
}
