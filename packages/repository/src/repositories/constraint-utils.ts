// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, FilterBuilder, Where, WhereBuilder} from '@loopback/filter';
import {cloneDeep} from 'lodash';
import {AnyObject, DataObject} from '../common-types';
import {Entity} from '../model';

/**
 * A utility function which takes a filter and enforces constraint(s)
 * on it
 * @param originalFilter - the filter to apply the constrain(s) to
 * @param constraint - the constraint which is to be applied on the filter
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
 * @param originalWhere - the where filter to apply the constrain(s) to
 * @param constraint - the constraint which is to be applied on the filter
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
 * A utility function which takes a where filter and enforces constraint(s)
 * on it with OR clause
 * @param originalWhere - the where filter to apply the constrain(s) to
 * @param constraint - the constraint which is to be applied on the filter with
 * or clause
 * @returns Filter the modified filter with the constraint, otherwise
 * the original filter
 */
export function constrainWhereOr<T extends object>(
  originalWhere: Where<T> | undefined,
  constraint: Where<T>[],
): Where<T> {
  const where = cloneDeep(originalWhere);
  const builder = new WhereBuilder<T>(where);
  return builder.or(constraint).build();
}
/**
 * A utility function which takes a model instance data and enforces constraint(s)
 * on it
 * @param originalData - the model data to apply the constrain(s) to
 * @param constraint - the constraint which is to be applied on the data object
 * @returns the modified data with the constraint, otherwise
 * the original instance data
 */
export function constrainDataObject<T extends Entity>(
  originalData: DataObject<T>,
  constraint: DataObject<T>,
): DataObject<T> {
  const constrainedData = cloneDeep(originalData);
  for (const c in constraint) {
    if (Object.prototype.hasOwnProperty.call(constrainedData, c)) {
      // Known limitation: === does not work for objects such as ObjectId
      if (originalData[c] === constraint[c]) continue;
      throw new Error(`Property "${c}" cannot be changed!`);
    }
    (constrainedData as AnyObject)[c] = constraint[c];
  }
  return constrainedData;
}

/**
 * A utility function which takes an array of model instance data and
 * enforces constraint(s) on it
 * @param originalData - the array of model data to apply the constrain(s) to
 * @param constraint - the constraint which is to be applied on the data objects
 * @returns an array of the modified data with the constraint, otherwise
 * the original instance data array
 */
export function constrainDataObjects<T extends Entity>(
  originalData: DataObject<T>[],
  constraint: DataObject<T>,
): DataObject<T>[] {
  return originalData.map(obj => constrainDataObject(obj, constraint));
}
