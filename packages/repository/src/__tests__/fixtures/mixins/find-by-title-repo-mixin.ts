// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {CrudRepository, Model, Where} from '../../..';

export interface FindByTitle<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model which extends Model
 *
 * @typeParam M - Model class
 */

export function FindByTitleRepositoryMixin<M extends Model & {title: string}>(
  superClass: Constructor<CrudRepository<M>>,
) {
  return class extends superClass implements FindByTitle<M> {
    async findByTitle(title: string): Promise<M[]> {
      const where = {title} as Where<M>;
      const titleFilter = {where};
      return this.find(titleFilter);
    }
  };
}
