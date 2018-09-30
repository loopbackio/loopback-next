// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, WhereBuilder, Where, FilterBuilder} from '../query';
import {AnyObject, DataObject} from '../common-types';
import {cloneDeep} from 'lodash';
import {Entity} from '../model';

/**
 * A utility function which takes a filter and enforces constraint(s)
 * on it
 * @param originalFilter the filter to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns Filter the modified filter with the constraint, otherwise
 * the original filter
 */
export function constrainFilter<T extends object>(
  originalFilter: Filter<T> | undefined,
  constraint: AnyObject,
): Filter<T> {
  const filter = cloneDeep(originalFilter);
  const builder = new FilterBuilder<T>(filter);
  return builder.impose(constraint).build();
}

/**
 * A utility function which takes a where filter and enforces constraint(s)
 * on it
 * @param originalWhere the where filter to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns Filter the modified filter with the constraint, otherwise
 * the original filter
 */
export function constrainWhere<T extends object>(
  originalWhere: Where<T> | undefined,
  constraint: Where<T>,
): Where<T> {
  const where = cloneDeep(originalWhere);
  const builder = new WhereBuilder<T>(where);
  return builder.impose(constraint).build();
}
/**
 * A utility function which takes a model instance data and enforces constraint(s)
 * on it
 * @param originalData the model data to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the data object
 * @returns the modified data with the constraint, otherwise
 * the original instance data
 */
export function constrainDataObject<T extends Entity>(
  originalData: DataObject<T>,
  constraint: DataObject<T>,
): DataObject<T> {
  const constrainedData = cloneDeep(originalData);
  for (const c in constraint) {
    if (constrainedData.hasOwnProperty(c))
      throw new Error(`Property "${c}" cannot be changed!`);
    (constrainedData as AnyObject)[c] = constraint[c];
  }
  return constrainedData;
}
/**
 * A utility function which takes an array of model instance data and
 * enforces constraint(s) on it
 * @param originalData the array of model data to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the data objects
 * @returns an array of the modified data with the constraint, otherwise
 * the original instance data array
 */
export function constrainDataObjects<T extends Entity>(
  originalData: DataObject<T>[],
  constraint: Partial<T>,
): DataObject<T>[] {
  const constrainedData = cloneDeep(originalData);
  for (let obj of constrainedData) {
    for (let prop in constraint) {
      (obj as AnyObject)[prop] = constraint[prop];
    }
  }
  return constrainedData;
}
