// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, WhereBuilder, Where, FilterBuilder} from '../query';
import {AnyObject, DataObject} from '../common-types';
import {cloneDeep, isArray} from 'lodash';
import {Entity} from '../model';

/**
 * A utility function which takes a filter and enforces constraint(s)
 * on it
 * @param originalFilter the filter to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns Filter the modified filter with the constraint, otherwise
 * the original filter
 */
export function constrainFilter(
  originalFilter: Filter | undefined,
  constraint: AnyObject,
): Filter {
  const builder = new FilterBuilder(originalFilter);
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
export function constrainWhere(
  originalWhere: Where | undefined,
  constraint: AnyObject,
): Where {
  const builder = new WhereBuilder(originalWhere);
  return builder.impose(constraint).build();
}

export function constrainDataObject<T extends Entity>(
  originalData: DataObject<T>,
  constraint: AnyObject,
): DataObject<T>;

export function constrainDataObject<T extends Entity>(
  originalData: DataObject<T>[],
  constraint: AnyObject,
): DataObject<T>[];
/**
 * A utility function which takes a model instance data and enforces constraint(s)
 * on it
 * @param originalData the model data to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns the modified data with the constraint, otherwise
 * the original instance data
 */
// tslint:disable-next-line:no-any
export function constrainDataObject(originalData: any, constraint: any): any {
  const constrainedData = cloneDeep(originalData);
  if (typeof originalData === 'object') {
    addConstraintToDataObject(constrainedData, constraint);
  } else if (isArray(originalData)) {
    for (const data in originalData) {
      addConstraintToDataObject(constrainedData[data], constraint[data]);
    }
  }
  return constrainedData;

  function addConstraintToDataObject(
    modelData: AnyObject,
    constrainObject: AnyObject,
  ) {
    for (const c in constrainObject) {
      if (c in modelData) {
        console.warn(
          'Overwriting %s with %s',
          modelData[c],
          constrainObject[c],
        );
      }
      modelData[c] = constrainObject[c];
    }
  }
}
