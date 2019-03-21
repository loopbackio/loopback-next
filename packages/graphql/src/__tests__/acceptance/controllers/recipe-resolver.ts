// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {plainToClass} from 'class-transformer';
import {ResolverInterface} from 'type-graphql';
import {
  arg,
  fieldResolver,
  Int,
  mutation,
  query,
  resolver,
  root,
} from '../../..';
import {RecipeInput} from '../graphql-types/recipe-input';
import {Recipe} from '../graphql-types/recipe-type';

@resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  private readonly items: Recipe[] = createRecipeSamples();

  @query(returns => Recipe, {nullable: true})
  async recipe(@arg('title') title: string): Promise<Recipe | undefined> {
    return await this.items.find(recipe => recipe.title === title);
  }

  @query(returns => [Recipe], {
    description: 'Get all the recipes from around the world ',
  })
  async recipes(): Promise<Recipe[]> {
    return await this.items;
  }

  @mutation(returns => Recipe)
  async addRecipe(@arg('recipe') recipeInput: RecipeInput): Promise<Recipe> {
    const recipe = plainToClass(Recipe, {
      description: recipeInput.description,
      title: recipeInput.title,
      ratings: [],
      creationDate: new Date(),
    });
    await this.items.push(recipe);
    return recipe;
  }

  @fieldResolver()
  ratingsCount(
    @root() recipe: Recipe,
    @arg('minRate', type => Int, {defaultValue: 0.0})
    minRate: number,
  ): number {
    return recipe.ratings.filter(rating => rating >= minRate).length;
  }
}

function createRecipeSamples() {
  return plainToClass(Recipe, [
    {
      description: 'Desc 1',
      title: 'Recipe 1',
      ratings: [0, 3, 1],
      creationDate: new Date('2018-04-11'),
    },
    {
      description: 'Desc 2',
      title: 'Recipe 2',
      ratings: [4, 2, 3, 1],
      creationDate: new Date('2018-04-15'),
    },
    {
      description: 'Desc 3',
      title: 'Recipe 3',
      ratings: [5, 4],
      creationDate: new Date(),
    },
  ]);
}
