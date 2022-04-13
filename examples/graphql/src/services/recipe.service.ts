// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {asService, injectable} from '@loopback/core';
import {Recipe} from '../graphql-types/recipe-type';

@injectable(asService(RecipeService))
export class RecipeService {
  ratingsCount(recipe: Recipe, minRate: number): number {
    return recipe.ratings.filter(rating => rating >= minRate).length;
  }
}
