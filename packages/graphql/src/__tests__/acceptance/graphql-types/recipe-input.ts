// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {field, inputType} from '../../..';
import {Recipe} from './recipe-type';

@inputType()
export class RecipeInput implements Partial<Recipe> {
  @field()
  title: string;

  @field({nullable: true})
  description?: string;
}
