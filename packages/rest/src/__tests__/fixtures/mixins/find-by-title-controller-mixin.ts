// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {Entity} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '../../../';

/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<E extends Entity> {
  findByTitle(title: string): Promise<E[]>;
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
  modelClass: typeof Entity;
}

/**
 * A mixin factory for controllers to be extended by `FindByTitle`
 * @param superClass - Base class
 * @param options - Options for the controller
 *
 * @typeParam E - Entity class
 * @typeParam T - Base class
 */
export function FindByTitleControllerMixin<
  E extends Entity,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Constructor<any> = Constructor<object>
>(superClass: T, options: FindByTitleControllerMixinOptions) {
  class MixedController extends superClass implements FindByTitle<E> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

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
    async findByTitle(@param.path.string('title') title: string): Promise<E[]> {
      return this.repository.findByTitle(title);
    }
  }

  return MixedController;
}
