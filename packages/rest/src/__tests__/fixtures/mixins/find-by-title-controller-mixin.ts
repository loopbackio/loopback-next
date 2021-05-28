// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MixinTarget} from '@loopback/core';
import {Model} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '../../../';

/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}

/**
 * Options to mix in findByTitle
 */
export interface FindByTitleControllerMixinOptions {
  /**
   * Base path for the controller
   */
  basePath: string;
  /**
   * Model class for CRUD
   */
  modelClass: typeof Model;
}

/**
 * A mixin factory for controllers to be extended by `FindByTitle`
 * @param superClass - Base class
 * @param options - Options for the controller
 *
 * @typeParam M - Model class
 * @typeParam T - Base class
 */
export function FindByTitleControllerMixin<
  M extends Model,
  T extends MixinTarget<object>,
>(superClass: T, options: FindByTitleControllerMixinOptions) {
  class MixedController extends superClass implements FindByTitle<M> {
    // Value will be provided by the subclassed controller class
    repository: FindByTitle<M>;

    @get(`${options.basePath}/findByTitle/{title}`, {
      responses: {
        '200': {
          description: `Array of ${options.modelClass.modelName} model instances`,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(options.modelClass, {
                  includeRelations: true,
                }),
              },
            },
          },
        },
      },
    })
    async findByTitle(@param.path.string('title') title: string): Promise<M[]> {
      return this.repository.findByTitle(title);
    }
  }

  return MixedController;
}
