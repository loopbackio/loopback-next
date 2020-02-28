// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {Model, property} from '../../..';

export function AddCategoryPropertyMixin<T extends Constructor<Model>>(
  superClass: T,
) {
  class MixedModel extends superClass {
    @property({
      type: 'string',
      required: true,
    })
    category: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }
  }
  return MixedModel;
}
