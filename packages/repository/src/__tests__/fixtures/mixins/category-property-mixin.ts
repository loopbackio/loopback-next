// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MixinTarget} from '@loopback/core';
import {Model, property} from '../../..';

/**
 * A mixin factory to add `category` property
 *
 * @param superClass - Base Class
 * @typeParam T - Model class
 */
export function AddCategoryPropertyMixin<T extends MixinTarget<Model>>(
  superClass: T,
) {
  class MixedModel extends superClass {
    @property({
      type: 'string',
      required: true,
    })
    category: string;
  }
  return MixedModel;
}
