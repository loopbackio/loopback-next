// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  arg,
  fieldResolver,
  Publisher,
  pubSub,
  query,
  resolver,
} from '../../../../';
import {mutation, root} from '../../../../decorators';
import {RecipeInput} from './recipe.input';
import {Recipe} from './recipe.model';

@resolver(of => Recipe)
export class RecipeResolver {
  constructor() {}

  @query(returns => [Recipe])
  async recipes(): Promise<Recipe[]> {
    return [];
  }

  @fieldResolver()
  lowercaseTitle(@root() recipe: Recipe) {
    return recipe.title.toLowerCase();
  }

  @mutation(returns => Recipe)
  async addRecipe(
    @arg('recipe') recipe: RecipeInput,
    @pubSub('recipeCreated') publish: Publisher<Recipe>,
  ): Promise<Recipe> {
    const result = new Recipe();
    result.title = recipe.title;
    await publish(result);
    return result;
  }
}
