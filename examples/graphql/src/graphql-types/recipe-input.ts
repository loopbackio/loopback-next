// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {field, inputType} from '@loopback/graphql';
import {Recipe} from './recipe-type';

@inputType()
export class RecipeInput implements Partial<Recipe> {
  @field()
  title: string;

  @field({nullable: true})
  description?: string;

  @field(type => [String])
  ingredients: string[];
}
