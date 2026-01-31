// Copyright IBM Corp. and LoopBack contributors 2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  arg,
  fieldResolver,
  GraphQLBindings,
  PubSub,
  query,
  resolver,
} from '../../../../';
import {mutation, root} from '../../../../decorators';
import {RecipeInput} from './recipe.input';
import {Recipe} from './recipe.model';

@resolver(of => Recipe)
export class RecipeResolver {
  constructor(@inject(GraphQLBindings.PUB_SUB) private pubSub: PubSub) {}

  @query(returns => [Recipe])
  async recipes(): Promise<Recipe[]> {
    return [];
  }

  @fieldResolver()
  lowercaseTitle(@root() recipe: Recipe) {
    return recipe.title.toLowerCase();
  }

  @mutation(returns => Recipe)
  async addRecipe(@arg('recipe') recipe: RecipeInput): Promise<Recipe> {
    const result = new Recipe();
    result.title = recipe.title;
    this.pubSub.publish('recipeCreated', result);
    return result;
  }
}
