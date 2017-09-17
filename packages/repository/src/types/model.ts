// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model, Class} from '..';
import {ObjectType} from './object';

// tslint:disable:no-any

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
