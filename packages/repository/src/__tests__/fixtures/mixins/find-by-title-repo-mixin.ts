// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MixinTarget} from '@loopback/core';
import {CrudRepository, Model, Where} from '../../..';

/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model which extends Model
 *
 * @param superClass - Base class
 *
 * @typeParam M - Model class which extends Model
 * @typeParam R - Repository class
 */
export function FindByTitleRepositoryMixin<
  M extends Model & {title: string},
  R extends MixinTarget<CrudRepository<M>>,
>(superClass: R) {
  class MixedRepository extends superClass implements FindByTitle<M> {
    async findByTitle(title: string): Promise<M[]> {
      const where = {title} as Where<M>;
      const titleFilter = {where};
      return this.find(titleFilter);
    }
  }
  return MixedRepository;
}
