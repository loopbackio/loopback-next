// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {CrudRepository, Model, Where} from '../../../index';
import {FindByTitleInterface} from './findByTitleInterface';

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model and 'R' is DefaultCrudRepository
 */
export function FindByTitleRepositoryMixin<
  M extends Model & {title: string},
  R extends Constructor<CrudRepository<M>>
>(superClass: R) {
  return class extends superClass implements FindByTitleInterface<M> {
    async findByTitle(title: string): Promise<M[]> {
      const where = {title} as Where<M>;
      const titleFilter = {where};
      return this.find(titleFilter);
    }
  };
}
