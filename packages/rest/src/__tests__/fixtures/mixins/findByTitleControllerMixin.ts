// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {Model} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '../../../';
import {FindByTitleInterface} from './findByTitleInterface';

export interface FindByTitleControllerMixinOptions {
  basePath: string;
  modelClass: typeof Model;
}

export function FindByTitleControllerMixin<
  M extends Model,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Constructor<any>
>(superClass: T, options: FindByTitleControllerMixinOptions) {
  class MixedController extends superClass implements FindByTitleInterface<M> {
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
    async findByTitle(@param.path.string('title') title: string): Promise<[M]> {
      return this.repository.findByTitle(title);
    }
  }

  return MixedController;
}
