// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {field, Float, ID, Int, objectType} from '@loopback/graphql';
import {Entity, model, property} from '@loopback/repository';

@objectType({description: 'Object representing cooking recipe'})
@model({settings: {strict: false}})
export class Recipe extends Entity {
  @field(type => ID)
  @property({id: true})
  id: string;

  @field()
  @property()
  title: string;

  @field(type => String, {
    nullable: true,
    deprecationReason: 'Use `description` field instead',
  })
  get specification(): string | undefined {
    return this.description;
  }

  @field({
    nullable: true,
    description: 'The recipe description with preparation info',
  })
  @property()
  description?: string;

  @field(type => [Int])
  ratings: number[];

  @field()
  @property()
  creationDate: Date;

  @field(type => Int)
  protected numberInCollection: number;

  @field(type => Int)
  ratingsCount: number;

  @field(type => [String])
  ingredients: string[];

  @field(type => Int)
  protected get ingredientsLength(): number {
    return this.ingredients.length;
  }

  @field(type => Float, {nullable: true})
  get averageRating(): number | null {
    const ratingsCount = this.ratings.length;
    if (ratingsCount === 0) {
      return null;
    }
    const ratingsSum = this.ratings.reduce((a, b) => a + b, 0);
    return ratingsSum / ratingsCount;
  }
}
