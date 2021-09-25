// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Directive} from 'type-graphql';
import {field, ID, objectType} from '../../../../';
@objectType({description: 'Object representing cooking recipe'})
export class Recipe {
  @field(type => ID)
  id: string;

  @field()
  title: string;

  @Directive('@lowercase')
  @field()
  lowercaseTitle: string;
}
