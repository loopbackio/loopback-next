// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {CrudRepository, Entity, Where} from '../../..';

/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<E extends Entity> {
  findByTitle(title: string): Promise<E[]>;
}

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'E' is a model which extends Model
 *
 * @param superClass - Base class
 *
 * @typeParam E - Model class which extends Entity
 * @typeParam R - Repository class
 */

export function FindByTitleRepositoryMixin<
  E extends Entity & {title: string},
  R extends Constructor<CrudRepository<E>>
>(superClass: R) {
  class MixedRepository extends superClass implements FindByTitle<E> {
    async findByTitle(title: string): Promise<E[]> {
      const where = {title} as Where<E>;
      const titleFilter = {where};
      return this.find(titleFilter);
    }
  }
  return MixedRepository;
}
