// Copyright The LoopBack Authors 2017,2021. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {Model} from '../model';
import {ObjectType} from './object';

/**
 * Model type
 */
export class ModelType<T extends Model> extends ObjectType<T> {
  readonly name: string = 'model';

  constructor(public modelClass: Class<T>) {
    super(modelClass);
  }

  serialize(value: T | null | undefined) {
    if (value == null) return value;
    return value.toJSON();
  }
}
