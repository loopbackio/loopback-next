// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, service} from '@loopback/core';
import {
  arg,
  authorized,
  fieldResolver,
  GraphQLBindings,
  Int,
  mutation,
  Publisher,
  pubSub,
  query,
  resolver,
  ResolverData,
  ResolverInterface,
  root,
  subscription,
} from '@loopback/graphql';
import {repository} from '@loopback/repository';
import {RecipeInput} from '../graphql-types/recipe-input';
import {Recipe} from '../graphql-types/recipe-type';
import {RecipeRepository} from '../repositories';
import {RecipeService} from '../services/recipe.service';

@resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  constructor(
    // constructor injection of service
    @repository('RecipeRepository')
    private readonly recipeRepo: RecipeRepository,
    @service(RecipeService) private readonly recipeService: RecipeService,
    // It's possible to inject the resolver data
    @inject(GraphQLBindings.RESOLVER_DATA) private resolverData: ResolverData,
  ) {}

  @query(returns => Recipe, {nullable: true})
  @authorized('owner')
  async recipe(@arg('recipeId') recipeId: string) {
    return this.recipeRepo.getOne(recipeId);
  }

  @query(returns => [Recipe])
  async recipes(): Promise<Recipe[]> {
    return this.recipeRepo.getAll();
  }

  @mutation(returns => Recipe)
  async addRecipe(
    @arg('recipe') recipe: RecipeInput,
    @pubSub('recipeCreated') publisher: Publisher<Recipe>,
  ): Promise<Recipe> {
    const result = await this.recipeRepo.add(recipe);
    await publisher(result);
    return result;
  }

  @subscription(returns => Recipe, {topics: 'recipeCreated'})
  async recipeCreated(@root() recipe: Recipe) {
    console.log('recipe created', recipe);
    return recipe;
  }

  @fieldResolver()
  async numberInCollection(@root() recipe: Recipe): Promise<number> {
    const index = await this.recipeRepo.findIndex(recipe);
    return index + 1;
  }

  @fieldResolver()
  ratingsCount(
    @root() recipe: Recipe,
    @arg('minRate', type => Int, {defaultValue: 0.0})
    minRate: number,
  ): number {
    return this.recipeService.ratingsCount(recipe, minRate);
  }
}
