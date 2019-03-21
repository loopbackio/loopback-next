// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {field, Float, Int, objectType} from '../../..';

@objectType({description: 'Object representing cooking recipe'})
export class Recipe {
  @field()
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
  description?: string;

  @field(type => [Int])
  ratings: number[];

  @field()
  creationDate: Date;

  @field(type => Int)
  ratingsCount: number;

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
