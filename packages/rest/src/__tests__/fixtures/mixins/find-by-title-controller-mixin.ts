// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {Entity} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '../../../';

export interface FindByTitle<E extends Entity> {
  findByTitle(title: string): Promise<E[]>;
}

export interface FindByTitleControllerMixinOptions {
  basePath: string;
  modelClass: typeof Entity;
}

export function FindByTitleControllerMixin<
  E extends Entity,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Constructor<any>
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
    async findByTitle(@param.path.string('title') title: string): Promise<[E]> {
      return this.repository.findByTitle(title);
    }
  }

  return MixedController;
}
