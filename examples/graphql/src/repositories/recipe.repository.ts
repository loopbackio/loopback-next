// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  ContextTags,
  inject,
  injectable,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {DefaultCrudRepository, RepositoryBindings} from '@loopback/repository';
import {plainToClass} from 'class-transformer';
import {RecipesDataSource} from '../datasources/recipes.datasource';
import {RecipeInput} from '../graphql-types/recipe-input';
import {Recipe} from '../graphql-types/recipe-type';

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.NAMESPACE]: RepositoryBindings.REPOSITORIES},
})
@lifeCycleObserver('repository')
export class RecipeRepository
  extends DefaultCrudRepository<Recipe, typeof Recipe.prototype.id, {}>
  implements LifeCycleObserver {
  private static idCounter = 0;

  @inject('recipes')
  private sampleRecipes: Recipe[];

  constructor(@inject('datasources.recipes') dataSource: RecipesDataSource) {
    super(Recipe, dataSource);
  }

  async start() {
    await this.createAll(this.sampleRecipes);
    // Increase the counter to avoid duplicate keys
    RecipeRepository.idCounter += this.sampleRecipes.length;
  }

  stop() {
    // Reset the id counter
    RecipeRepository.idCounter = 0;
  }

  async getAll() {
    return this.find();
  }

  async getOne(id: string) {
    return this.findById(id);
  }

  async add(data: RecipeInput) {
    const recipe = this.createRecipe(data);
    return this.create(recipe);
  }

  async findIndex(recipe: Recipe) {
    const recipes = await this.find();
    return recipes.findIndex(r => r.id === recipe.id);
  }

  private createRecipe(recipeData: Partial<Recipe>): Recipe {
    const recipe = plainToClass(Recipe, recipeData);
    recipe.id = this.getId();
    recipe.creationDate = new Date('2020-05-24');
    recipe.ratings = [2, 4];
    return recipe;
  }

  private getId(): string {
    return (++RecipeRepository.idCounter).toString();
  }
}
